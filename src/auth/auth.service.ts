import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterOfficeDto } from './dto';

// Fluxo automático: compra -> cria conta -> cria escritório + office_id + admin
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async registerOffice(dto: RegisterOfficeDto) {
    const existing = await this.prisma.user.findFirst({ where: { email: dto.adminEmail } });
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const office = await this.prisma.office.create({
      data: { name: dto.officeName, document: dto.officeDocument },
    });

    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);
    const admin = await this.prisma.user.create({
      data: {
        officeId: office.id,
        name: dto.adminName,
        email: dto.adminEmail,
        passwordHash,
        role: 'ADMIN',
      },
    });

    return this.issueToken(admin.id, office.id, admin.role, admin.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    if (user.blocked) throw new UnauthorizedException('Usuário bloqueado');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    return this.issueToken(user.id, user.officeId, user.role, user.email);
  }

  private issueToken(sub: string, officeId: string, role: string, email: string) {
    const access_token = this.jwt.sign({ sub, officeId, role, email });
    return { access_token, user: { id: sub, officeId, role, email } };
  }
}
