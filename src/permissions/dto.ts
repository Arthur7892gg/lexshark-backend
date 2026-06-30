import { IsBoolean, IsString } from 'class-validator';

export class SetPermissionDto {
  @IsString() key: string;
  @IsBoolean() allowed: boolean;
}

// Lista das chaves de permissão suportadas pelo sistema (referência para o front)
export const PERMISSION_KEYS = [
  'view_case_values',
  'edit_cases',
  'create_tasks',
  'view_others_tasks',
  'manage_team',
  'edit_agenda',
  'export_backup',
  'import_backup',
  'financial_dashboard',
];
