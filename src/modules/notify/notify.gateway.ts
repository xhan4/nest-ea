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

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    console.log(client.handshake.query)
    if (userId) {
      this.connectedClients.set(Number(userId), client);
    }
  }

  handleDisconnect(client: Socket) {
     console.log(client.handshake.query)
    const userId = client.handshake.query.userId;
    if (userId) {
      this.connectedClients.delete(Number(userId));
    }
  }

  sendNotify(userId: number, event: string, data: any) {
    const client = this.connectedClients.get(userId);
    console.log(client,userId,event,data)
    if (client) {
      client.emit(event, data);
    }
  }
}
