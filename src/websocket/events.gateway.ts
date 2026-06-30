import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

// Cada socket entra em uma "room" = office_id, e outra room = user_id.
// Isso garante isolamento por escritório e entrega direcionada por usuário,
// sem precisar dar refresh na página (atende ao requisito de tarefas em tempo real).
@WebSocketGateway({ cors: { origin: '*' }, namespace: '/realtime' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('EventsGateway');

  constructor(private jwt: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      const payload: any = this.jwt.verify(token as string, {
        secret: process.env.JWT_SECRET || 'lexshark-dev-secret',
      });
      client.join(`office:${payload.officeId}`);
      client.join(`user:${payload.sub}`);
      (client as any).user = payload;
    } catch (e) {
      this.logger.warn('Conexão WebSocket rejeitada: token inválido');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // cleanup automático pelo socket.io
  }

  emitTaskCreated(officeId: string, ownerId: string, task: any) {
    this.server.to(`office:${officeId}`).to(`user:${ownerId}`).emit('task:created', task);
  }

  emitTaskUpdated(officeId: string, ownerId: string, task: any) {
    this.server.to(`office:${officeId}`).to(`user:${ownerId}`).emit('task:updated', task);
  }

  emitMessage(officeId: string, message: any) {
    this.server.to(`office:${officeId}`).emit('message:new', message);
  }
}
