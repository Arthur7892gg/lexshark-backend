import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OfficesService {
  constructor(private prisma: PrismaService) {}

  findOwn(officeId: string) {
    return this.prisma.office.findUnique({ where: { id: officeId } });
  }
}
