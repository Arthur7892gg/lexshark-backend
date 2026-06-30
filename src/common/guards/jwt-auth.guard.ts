import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Garante token válido E injeta { sub, officeId, role } em request.user
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
