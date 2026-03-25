import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-wechat';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WechatStrategy extends PassportStrategy(Strategy, 'wechat') {
  constructor(private configService: ConfigService) {
    super({
      appID: configService.get('wechat.appid') || 'placeholder_appid',
      appSecret: configService.get('wechat.secret') || 'placeholder_secret',
      callbackURL: configService.get('wechat.redirectUrl') || 'http://localhost:3000/auth/callback',
      scope: 'snsapi_userinfo',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      openid: profile.openid,
      nickname: profile.nickname,
      avatar: profile.headimgurl,
    };
  }
}