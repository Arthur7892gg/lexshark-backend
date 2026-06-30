import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PERMISSION_KEYS } from './dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  listKeys() {
    return PERMISSION_KEYS;
  }

  findForUser(officeId: string, userId: string) {
    return this.prisma.permission.findMany({ where: { officeId, userId } });
  }

  async set(officeId: string, userId: string, key: string, allowed: boolean) {
    return this.prisma.permission.upsert({
      where: { userId_key: { userId, key } },
      update: { allowed },
      create: { officeId, userId, key, allowed },
    });
  }
}
