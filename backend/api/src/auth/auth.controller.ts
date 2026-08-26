import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Inject,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterODT } from './ODTs/auth.odts';
import { LocalAuthGuard } from './guards/local-auth.guards/local-auth.guards.guard';
import { JwtAuthGuard } from './guards/jwt-auth-guards/jwt-auth-guards.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-guards/refresh-jwt-guards.guard';
import { CurrentUser } from './decorators/user.decorator';
import { Usuario } from 'src/users/types/users.types';
import cookieConfig from './config/cookie.config';
import { ConfigType } from '@nestjs/config';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(cookieConfig.KEY)
    private readonly cookieConfigService: ConfigType<typeof cookieConfig>,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: Usuario,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } =
      await this.authService.login(user);
    res.cookie(
      'refresh_token',
      refreshToken,
      this.cookieConfigService.refreshCookie,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: Usuario,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return this.authService.logout(user);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(
    @Body() data: RegisterODT,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } =
      await this.authService.register(data);
    res.cookie(
      'refresh_token',
      refreshToken,
      this.cookieConfigService.refreshCookie,
    );
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/profile')
  getProfile(@CurrentUser() user: Usuario) {
    return user;
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('/refresh-token')
  async refreshToken(
    @CurrentUser() user: Usuario,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } =
      await this.authService.refreshToken(user);
    res.cookie(
      'refresh_token',
      refreshToken,
      this.cookieConfigService.refreshCookie,
    );
    return response;
  }
}
