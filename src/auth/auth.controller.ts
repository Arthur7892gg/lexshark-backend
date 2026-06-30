import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterOfficeDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // Cadastro automático do escritório (compra do sistema)
  @Post('register-office')
  registerOffice(@Body() dto: RegisterOfficeDto) {
    return this.auth.registerOffice(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
