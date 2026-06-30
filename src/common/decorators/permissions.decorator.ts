import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
// Uso: @Permissions('manage_team', 'edit_agenda')
export const Permissions = (...keys: string[]) => SetMetadata(PERMISSIONS_KEY, keys);
