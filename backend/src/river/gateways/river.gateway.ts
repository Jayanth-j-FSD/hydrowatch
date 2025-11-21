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
import { RiverService } from '../river.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/river',
})
export class RiverGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RiverGateway.name);
  private readonly subscribedStations = new Map<string, Set<string>>();

  constructor(private readonly riverService: RiverService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up subscriptions
    this.subscribedStations.forEach((clients, stationId) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.subscribedStations.delete(stationId);
      }
    });
  }

  @SubscribeMessage('subscribe:station')
  handleSubscribeStation(
    client: Socket,
    @MessageBody() data: { stationId: string },
  ) {
    const { stationId } = data;
    if (!this.subscribedStations.has(stationId)) {
      this.subscribedStations.set(stationId, new Set());
    }
    this.subscribedStations.get(stationId)!.add(client.id);
    client.join(`station:${stationId}`);
    this.logger.log(`Client ${client.id} subscribed to station ${stationId}`);
  }

  @SubscribeMessage('unsubscribe:station')
  handleUnsubscribeStation(
    client: Socket,
    @MessageBody() data: { stationId: string },
  ) {
    const { stationId } = data;
    const clients = this.subscribedStations.get(stationId);
    if (clients) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.subscribedStations.delete(stationId);
      }
    }
    client.leave(`station:${stationId}`);
    this.logger.log(`Client ${client.id} unsubscribed from station ${stationId}`);
  }

  broadcastLevelUpdate(stationId: string, levelData: any) {
    this.server.to(`station:${stationId}`).emit('level:update', {
      stationId,
      ...levelData,
    });
  }

  broadcastAlert(stationId: string, alertData: any) {
    this.server.to(`station:${stationId}`).emit('alert:triggered', {
      stationId,
      ...alertData,
    });
  }
}

