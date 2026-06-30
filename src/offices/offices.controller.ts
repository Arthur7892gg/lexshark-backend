import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OfficesService } from './offices.service';

@UseGuards(JwtAuthGuard)
@Controller('offices')
export class OfficesController {
  constructor(private offices: OfficesService) {}

  @Get('me')
  findOwn(@CurrentUser() user) {
    return this.offices.findOwn(user.officeId);
  }
}
