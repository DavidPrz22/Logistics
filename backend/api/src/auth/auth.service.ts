import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterODT } from './ODTs/auth.odts';
import { AuthResponse, TokenPayload } from './types/auth.types';
import { Usuario } from 'src/users/types/users.types';
import { JwtService } from '@nestjs/jwt';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { HttpStatus } from '@nestjs/common';
@Injectable()
export class AuthService {
  constructor(
    private readonly UsersService: UsersService,
    private readonly jwt: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<Usuario | null> {
    const user = await this.UsersService.findOneByName(username);
    if (!user) {
      throw new UnauthorizedException('No user with that name');
    }
    const isCorrect = await argon2.verify(user.hashPassword, password);

    if (isCorrect) {
      const { hashPassword, refreshToken, ...usuario } = user;
      return usuario;
    }
    return null;
  }

  generateTokens(user: Usuario) {
    const payload: TokenPayload = {
      sub: user.id,
      nombreUsuario: user.nombreUsuario,
      rol: user.rol,
    };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, this.refreshTokenConfig);
    return { accessToken, refreshToken };
  }

  async login(user: Usuario): Promise<AuthResponse> {
    const { accessToken, refreshToken } = this.generateTokens(user);
    const hashedToken = await argon2.hash(refreshToken);
    await this.UsersService.updateRefreshToken(user.id, hashedToken);
    return {
      usuario: user,
      accessToken,
      refreshToken,
    };
  }

  async register(data: RegisterODT): Promise<AuthResponse> {
    const { password, ...userData } = data;
    const hashedPassword = await argon2.hash(password);
    const user = await this.UsersService.create({
      ...userData,
      hashPassword: hashedPassword,
    });

    const { accessToken, refreshToken } = this.generateTokens(user);
    const hashedToken = await argon2.hash(refreshToken);
    await this.UsersService.updateRefreshToken(user.id, hashedToken);

    return {
      usuario: user,
      accessToken,
      refreshToken,
    };
  }

  async logout(usuario: Usuario) {
    await this.UsersService.updateRefreshToken(usuario.id, null);
    return {
      statusCode: HttpStatus.OK,
      message: 'Session terminated successfully',
    };
  }

  async refreshToken(user: Usuario) {
    const payload: TokenPayload = {
      sub: user.id,
      nombreUsuario: user.nombreUsuario,
      rol: user.rol,
    };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, this.refreshTokenConfig);
    const hashedToken = await argon2.hash(refreshToken);
    await this.UsersService.updateRefreshToken(user.id, hashedToken);
    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
