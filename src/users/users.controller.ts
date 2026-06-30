import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto, ResetPasswordDto, UpdateUserDto } from './dto';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  @Permissions('manage_team')
  findAll(@CurrentUser() user) {
    return this.users.findAll(user.officeId);
  }

  @Post()
  @Permissions('manage_team')
  create(@CurrentUser() user, @Body() dto: CreateUserDto) {
    return this.users.create(user.officeId, dto);
  }

  @Patch(':id')
  @Permissions('manage_team')
  update(@CurrentUser() user, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(user.officeId, id, dto);
  }

  @Delete(':id')
  @Permissions('manage_team')
  remove(@CurrentUser() user, @Param('id') id: string) {
    return this.users.remove(user.officeId, id);
  }

  @Patch(':id/reset-password')
  @Permissions('manage_team')
  resetPassword(@CurrentUser() user, @Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.users.resetPassword(user.officeId, id, dto.password);
  }
}
