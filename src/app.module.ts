import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OfficesModule } from './offices/offices.module';
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { TasksModule } from './tasks/tasks.module';
import { SyncModule } from './sync/sync.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OfficesModule,
    UsersModule,
    PermissionsModule,
    TasksModule,
    SyncModule,
    WebsocketModule,
  ],
})
export class AppModule {}
