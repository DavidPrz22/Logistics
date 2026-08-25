import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterODT } from './ODTs/auth.odts';
import { LocalAuthGuard } from './guards/local-auth.guards/local-auth.guards.guard';
import { JwtAuthGuard } from './guards/jwt-auth-guards/jwt-auth-guards.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-guards/refresh-jwt-guards.guard';
import { CurrentUser } from './decorators/user.decorator';
import { Usuario } from 'src/users/types/users.types';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@CurrentUser() user: Usuario) {
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser() user: Usuario) {
    return this.authService.logout(user);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  register(@Body() data: RegisterODT) {
    return this.authService.register(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/profile')
  getProfile(@CurrentUser() user: Usuario) {
    return user;
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('/refresh-token')
  refreshToken(@CurrentUser() user: Usuario) {
    return this.authService.refreshToken(user);
  }
}
