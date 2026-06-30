import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../websocket/events.gateway';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService, private gateway: EventsGateway) {}

  // Admin vê tudo; membro vê só as suas, a menos que tenha "view_others_tasks"
  async findAll(officeId: string, currentUserId: string, isAdmin: boolean, canViewOthers: boolean) {
    const where =
      isAdmin || canViewOthers ? { officeId } : { officeId, ownerId: currentUserId };
    return this.prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async create(officeId: string, createdById: string, dto: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        officeId,
        title: dto.title,
        description: dto.description,
        ownerId: dto.ownerId,
        createdById,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
    // Aparece automaticamente para o responsável, sem refresh, via WebSocket
    this.gateway.emitTaskCreated(officeId, task.ownerId, task);
    return task;
  }

  async update(officeId: string, taskId: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findFirst({ where: { id: taskId, officeId } });
    if (!existing) throw new NotFoundException('Tarefa não encontrada');

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined },
    });
    this.gateway.emitTaskUpdated(officeId, task.ownerId, task);
    return task;
  }

  async remove(officeId: string, taskId: string) {
    const existing = await this.prisma.task.findFirst({ where: { id: taskId, officeId } });
    if (!existing) throw new NotFoundException('Tarefa não encontrada');
    return this.prisma.task.delete({ where: { id: taskId } });
  }
}
