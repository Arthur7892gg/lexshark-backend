import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasks: TasksService, private prisma: PrismaService) {}

  @Get()
  async findAll(@CurrentUser() user) {
    const isAdmin = user.role === 'ADMIN';
    let canViewOthers = false;
    if (!isAdmin) {
      const perm = await this.prisma.permission.findUnique({
        where: { userId_key: { userId: user.sub, key: 'view_others_tasks' } },
      });
      canViewOthers = !!perm?.allowed;
    }
    return this.tasks.findAll(user.officeId, user.sub, isAdmin, canViewOthers);
  }

  @Post()
  @Permissions('create_tasks')
  create(@CurrentUser() user, @Body() dto: CreateTaskDto) {
    return this.tasks.create(user.officeId, user.sub, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(user.officeId, id, dto);
  }

  @Delete(':id')
  @Permissions('create_tasks')
  remove(@CurrentUser() user, @Param('id') id: string) {
    return this.tasks.remove(user.officeId, id);
  }
}
