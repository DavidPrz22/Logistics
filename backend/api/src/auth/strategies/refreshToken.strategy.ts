import { Usuario } from 'src/users/types/users.types';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { TokenPayload } from '../types/auth.types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly user: UsersService,
  ) {
    const refreshTokenSecret = config.getOrThrow<string>('REFRESH_JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: refreshTokenSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayload): Promise<Usuario | null> {
    const refreshTokenAuth = req
      .get('Authorization')
      ?.replace('Bearer', '')
      .trim();
    if (!refreshTokenAuth) {
      throw new UnauthorizedException('Unauthorized: Refresh token missing');
    }

    const user = await this.user.findOneByName(payload.nombreUsuario);
    if (!user) {
      throw new UnauthorizedException('Unauthorized: No user');
    }

    if (!user.refreshToken) {
      throw new UnauthorizedException(
        'Unauthorized: User has no active session',
      );
    }

    const hashCompare = await argon2.verify(
      user.refreshToken,
      refreshTokenAuth,
    );
    if (!hashCompare) {
      throw new UnauthorizedException('Unauthorized: Invalid token');
    }
    const { refreshToken, hashPassword, ...userData } = user;
    return userData;
  }
}
