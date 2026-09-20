import { GoogleOauthGuard } from './google-oauth-guard.guard';

describe('GoogleOauthGuard', () => {
  it('should be defined', () => {
    expect(new GoogleOauthGuard()).toBeDefined();
  });
});
