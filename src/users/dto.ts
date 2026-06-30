import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @MinLength(8) password: string;
}

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsBoolean() blocked?: boolean;
}

export class ResetPasswordDto {
  @MinLength(8) password: string;
}
