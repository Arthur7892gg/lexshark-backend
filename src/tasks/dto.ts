import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsString() ownerId: string;
  @IsOptional() @IsDateString() dueDate?: string;
}

export class UpdateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() status?: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  @IsOptional() @IsDateString() dueDate?: string;
}
