import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginODT, RegisterODT } from './ODTs/auth.odts';
import { AuthResponse, TokenPayload } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(data: LoginODT): Promise<AuthResponse> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: data.correo },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(data.password, usuario.hashContrasena);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: TokenPayload = {
      sub: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      correo: usuario.correo,
      Rol: usuario.Rol,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { refreshToken },
    });

    return {
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        correo: usuario.correo,
        Rol: usuario.Rol,
      },
      accessToken,
      refreshToken,
    };
  }

  async register(data: RegisterODT): Promise<AuthResponse> {
    const existingUser = await this.prisma.usuario.findFirst({
      where: {
        OR: [{ correo: data.correo }, { nombreUsuario: data.nombreUsuario }],
      },
    });

    if (existingUser) {
      throw new ConflictException('El correo o nombre de usuario ya existe');
    }

    const hashContrasena = await bcrypt.hash(data.password, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombreUsuario: data.nombreUsuario,
        correo: data.correo,
        hashContrasena,
        Rol: data.Rol,
      },
    });

    const payload: TokenPayload = {
      sub: usuario.id,
      nombreUsuario: usuario.nombreUsuario,
      correo: usuario.correo,
      Rol: usuario.Rol,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { refreshToken },
    });

    return {
      usuario: {
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        correo: usuario.correo,
        Rol: usuario.Rol,
      },
      accessToken,
      refreshToken,
    };
  }
}
