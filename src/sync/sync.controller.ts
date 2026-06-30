import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SyncService } from './sync.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sync')
export class SyncController {
  constructor(private sync: SyncService) {}

  @Get('pull')
  pullAll(@CurrentUser() user) {
    return this.sync.pullAll(user.officeId);
  }

  @Post('clients')
  pushClients(@CurrentUser() user, @Body() body: { items: any[] }) {
    return this.sync.pushClients(user.officeId, body.items);
  }

  @Post('cases')
  pushCases(@CurrentUser() user, @Body() body: { items: any[] }) {
    return this.sync.pushCases(user.officeId, body.items);
  }

  @Post('agenda')
  @Permissions('edit_agenda')
  pushAgenda(@CurrentUser() user, @Body() body: { items: any[] }) {
    return this.sync.pushAgenda(user.officeId, body.items);
  }

  @Post('backup/export')
  @Permissions('export_backup')
  logExport(@CurrentUser() user, @Body() body: { fileName?: string }) {
    return this.sync.logBackup(user.officeId, 'export', body.fileName);
  }

  @Post('backup/import')
  @Permissions('import_backup')
  logImport(@CurrentUser() user, @Body() body: { fileName?: string }) {
    return this.sync.logBackup(user.officeId, 'import', body.fileName);
  }
}
