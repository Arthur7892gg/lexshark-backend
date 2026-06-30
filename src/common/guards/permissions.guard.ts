import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

// Administradores sempre passam. Membros precisam ter a permissão explícita = true.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('Não autenticado');
    if (user.role === 'ADMIN') return true;

    const perms = await this.prisma.permission.findMany({
      where: { userId: user.sub, key: { in: required }, allowed: true },
    });
    const grantedKeys = new Set(perms.map((p) => p.key));
    const ok = required.every((k) => grantedKeys.has(k));
    if (!ok) throw new ForbiddenException('Permissão insuficiente');
    return true;
  }
}
