import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';

// Todo método aqui já recebe officeId do token (multi-tenant isolation)
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll(officeId: string) {
    return this.prisma.user.findMany({
      where: { officeId },
      select: { id: true, name: true, email: true, role: true, blocked: true, createdAt: true },
    });
  }

  async create(officeId: string, dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: { officeId, name: dto.name, email: dto.email, passwordHash, role: 'MEMBER' },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async update(officeId: string, userId: string, dto: UpdateUserDto) {
    await this.assertBelongsToOffice(officeId, userId);
    return this.prisma.user.update({ where: { id: userId }, data: dto });
  }

  async remove(officeId: string, userId: string) {
    await this.assertBelongsToOffice(officeId, userId);
    return this.prisma.user.delete({ where: { id: userId } });
  }

  async resetPassword(officeId: string, userId: string, password: string) {
    await this.assertBelongsToOffice(officeId, userId);
    const passwordHash = await bcrypt.hash(password, 10);
    return this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  private async assertBelongsToOffice(officeId: string, userId: string) {
    const user = await this.prisma.user.findFirst({ where: { id: userId, officeId } });
    if (!user) throw new NotFoundException('Usuário não encontrado neste escritório');
    return user;
  }
}
