import { SetMetadata } from '@nestjs/common';
import { Rol } from 'prisma/generated/prisma/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: [Rol, ...Rol[]]) =>
  SetMetadata(ROLES_KEY, roles);
