import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ // 明确指定端口
  cors: {
    origin: '*',
  },
  path: '/ws',     // 命名空间
  transports: ['websocket'],
})
export class NotifyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;  // 添加这个属性
  private connectedClients = new Map<number, Socket>();
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) { }
  afterInit(server: Server) {
    // 添加身份验证中间件
    server.use(async (client, next) => {
      try {
        const token = client.handshake.auth.token as string;
        if (!token) {
          throw new HttpException('验证不通过', HttpStatus.FORBIDDEN);
        }
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get('JWT_SECRET')
        })
        client.data = payload;
        next();
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          next(new HttpException('Token已过期，请重新登录或刷新Token', HttpStatus.REQUEST_TIMEOUT));
        } else {
          next(new HttpException('Token验证失败', HttpStatus.FORBIDDEN));
        }
      }
    });
  }
  handleConnection(client: Socket) {
    const characterId = client.data.characterId;
    if (characterId) {
      this.connectedClients.set(Number(characterId), client);
    }
  }

  handleDisconnect(client: Socket) {
    const characterId = client.data.characterId;
    if (characterId) {
      this.connectedClients.delete(Number(characterId));
    }
  }

  sendNotify(characterId: number, event: string, data: any) {
    const client = this.connectedClients.get(characterId);
    if (client) {
      client.emit(event, data);
    }
  }
}