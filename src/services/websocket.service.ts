import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  },
  namespace: '/notifications'
})
export class WebSocketService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketService.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    
    if (userId) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
      
      client.join(`user:${userId}`);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    } else {
      this.logger.warn(`Connection without userId: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    
    if (userId && this.userSockets.has(userId)) {
      const userSocketSet = this.userSockets.get(userId)!;
      userSocketSet.delete(client.id);
      
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
      }
      
      this.logger.log(`User ${userId} disconnected socket ${client.id}`);
    }
  }

  async sendToUser(userId: string, event: string, data: any): Promise<boolean> {
    try {
      const room = `user:${userId}`;
      const socketsInRoom = await this.server.in(room).fetchSockets();
      
      if (socketsInRoom.length > 0) {
        this.server.to(room).emit(event, data);
        this.logger.log(`Sent ${event} to user ${userId} (${socketsInRoom.length} sockets)`);
        return true;
      } else {
        this.logger.warn(`No active sockets for user ${userId}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send to user ${userId}: ${error.message}`);
      return false;
    }
  }

  async broadcastToAll(event: string, data: any): Promise<void> {
    try {
      this.server.emit(event, data);
      this.logger.log(`Broadcasted ${event} to all connected clients`);
    } catch (error) {
      this.logger.error(`Failed to broadcast: ${error.message}`);
    }
  }

  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }
}