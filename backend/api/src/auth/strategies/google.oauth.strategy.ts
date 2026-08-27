import { VerifiedCallback } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Usuario } from 'src/users/types/users.types';
import { GoogleProfile } from '../types/auth.types';
import { Strategy } from 'passport-google-oauth2';
import googleOauthConfig from '../config/google.oauth.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private OauthConfig: ConfigType<typeof googleOauthConfig>,
    private usersService: UsersService,
  ) {
    super({
      clientID: OauthConfig.clientID as string,
      clientSecret: OauthConfig.clientSecret as string,
      callbackURL: OauthConfig.callbackUrl as string,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
    done: VerifiedCallback,
  ): Promise<Usuario> {
    const { emails, displayName } = profile;
    const email = emails[0].value;

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        nombreUsuario: displayName || email,
        correo: email,
        hashPassword: '', // No password for OAuth users
        rol: 'OPERADOR', // Default role
      });
    }

    done(null, user);
    return user;
  }
}
