import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { DamsService } from '../dams.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/dams',
})
export class DamsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DamsGateway.name);
  private readonly subscribedDams = new Map<string, Set<string>>();

  constructor(private readonly damsService: DamsService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.subscribedDams.forEach((clients, damId) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.subscribedDams.delete(damId);
      }
    });
  }

  @SubscribeMessage('subscribe:dam')
  handleSubscribeDam(
    client: Socket,
    @MessageBody() data: { damId: string },
  ) {
    const { damId } = data;
    if (!this.subscribedDams.has(damId)) {
      this.subscribedDams.set(damId, new Set());
    }
    this.subscribedDams.get(damId)!.add(client.id);
    client.join(`dam:${damId}`);
    this.logger.log(`Client ${client.id} subscribed to dam ${damId}`);
  }

  @SubscribeMessage('unsubscribe:dam')
  handleUnsubscribeDam(
    client: Socket,
    @MessageBody() data: { damId: string },
  ) {
    const { damId } = data;
    const clients = this.subscribedDams.get(damId);
    if (clients) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.subscribedDams.delete(damId);
      }
    }
    client.leave(`dam:${damId}`);
    this.logger.log(`Client ${client.id} unsubscribed from dam ${damId}`);
  }

  broadcastCapacityUpdate(damId: string, capacityData: any) {
    this.server.to(`dam:${damId}`).emit('capacity:update', {
      damId,
      ...capacityData,
    });
  }

  broadcastOverflowAlert(damId: string, alertData: any) {
    this.server.to(`dam:${damId}`).emit('overflow:alert', {
      damId,
      ...alertData,
    });
  }
}

