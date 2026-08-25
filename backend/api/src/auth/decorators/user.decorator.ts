import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Usuario } from 'src/users/types/users.types';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Usuario => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as unknown as Usuario;
  },
);
