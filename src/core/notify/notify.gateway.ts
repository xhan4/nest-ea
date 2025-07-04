import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway(3006, { // 明确指定端口
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket']
})
export class NotifyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private connectedClients = new Map<number, Socket>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      this.connectedClients.set(Number(userId), client);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      this.connectedClients.delete(Number(userId));
    }
  }

  sendToUser(userId: number, event: string, data: any) {
    const client = this.connectedClients.get(userId);
    if (client) {
      client.emit(event, data);
    }
  }
}
