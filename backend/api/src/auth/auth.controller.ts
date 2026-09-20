import {
  Controller,
  Get,
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
import frontendConfig from './config/frontend.config';
import { ConfigType } from '@nestjs/config';
import { GoogleOauthGuard } from './guards/google-oauth-guard/google-oauth-guard.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(cookieConfig.KEY)
    private readonly cookieConfigService: ConfigType<typeof cookieConfig>,
    @Inject(frontendConfig.KEY)
    private readonly frontendConfigService: ConfigType<typeof frontendConfig>,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: Usuario,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...response } = await this.authService.login(user);
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
    const { refreshToken, ...response } = await this.authService.register(data);
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

  @UseGuards(GoogleOauthGuard)
  @Get('google/login')
  async googleLogin() {}

  @UseGuards(GoogleOauthGuard)
  @Get('google/callback')
  async googleCallback(@CurrentUser() user: Usuario, @Res() res: Response) {
    const { refreshToken, accessToken, usuario } =
      await this.authService.login(user);

    res.cookie(
      'refresh_token',
      refreshToken,
      this.cookieConfigService.refreshCookie,
    );

    const frontendUrl = this.frontendConfigService.url;

    const html = `
      <html>
        <body>
          <h1>Autenticación exitosa</h1>
          <p>Puedes cerrar esta ventana.</p>
          <script>
            if (window.opener) {
              try {
                window.opener.postMessage(
                  {
                    type: 'GOOGLE_AUTH_SUCCESS',
                    payload: {
                      accessToken: '${accessToken}',
                      usuario: ${JSON.stringify(usuario)}
                    }
                  },
                  '${frontendUrl}'
                );
              } catch (error) {
                console.error('Error al enviar postMessage:', error);
              }
              
              setTimeout(() => {
                window.close();
              }, 3000);
            } else {
              document.body.innerHTML += '<p style="color: red;">Error: no se pudo comunicar con la ventana principal</p>';
            }
          </script>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
