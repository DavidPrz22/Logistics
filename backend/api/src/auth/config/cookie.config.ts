import { registerAs } from '@nestjs/config';
import { CookieOptions } from 'express';

function parseExpirationToMs(expiration: string | undefined): number {
  if (!expiration) return 7 * 24 * 60 * 60 * 1000;

  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
}

export default registerAs('cookie', () => {
  const maxAge = parseExpirationToMs(process.env.REFRESH_JWT_EXPIRATION_TIME);

  return {
    refreshCookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: 'strict' as const,
      path: '/api/auth',
      maxAge,
    } satisfies CookieOptions,
  };
});
