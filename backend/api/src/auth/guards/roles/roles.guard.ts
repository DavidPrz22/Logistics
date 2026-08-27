import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from 'prisma/generated/prisma/enums';
import { ROLES_KEY } from 'src/auth/decorators/roles.decorator';
import { Usuario } from 'src/users/types/users.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const user = context.switchToHttp().getRequest<{ user: Usuario }>().user;
    return requiredRoles.some((role) => user.rol === role);
  }
}
