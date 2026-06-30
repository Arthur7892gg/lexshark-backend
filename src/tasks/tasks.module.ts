import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [WebsocketModule],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
