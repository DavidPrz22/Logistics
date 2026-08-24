import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginODT, RegisterODT } from './ODTs/auth.odts';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  login(@Body() data: LoginODT) {
    return this.authService.login(data);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  register(@Body() data: RegisterODT) {
    return this.authService.register(data);
  }
}
