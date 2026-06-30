import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PermissionsService } from './permissions.service';
import { SetPermissionDto } from './dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private perms: PermissionsService) {}

  @Get('keys')
  listKeys() {
    return this.perms.listKeys();
  }

  @Get(':userId')
  @Permissions('manage_team')
  findForUser(@CurrentUser() user, @Param('userId') userId: string) {
    return this.perms.findForUser(user.officeId, userId);
  }

  @Post(':userId')
  @Permissions('manage_team')
  set(@CurrentUser() user, @Param('userId') userId: string, @Body() dto: SetPermissionDto) {
    return this.perms.set(user.officeId, userId, dto.key, dto.allowed);
  }
}
