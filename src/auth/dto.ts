import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterOfficeDto {
  @IsString() officeName: string;
  @IsOptional() @IsString() officeDocument?: string;
  @IsString() adminName: string;
  @IsEmail() adminEmail: string;
  @MinLength(8) adminPassword: string;
}

export class LoginDto {
  @IsEmail() email: string;
  @IsString() password: string;
}
