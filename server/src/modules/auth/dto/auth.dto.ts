import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录code' })
  @IsString()
  code: string;

  @ApiProperty({ description: '用户信息', required: false })
  @IsOptional()
  @IsObject()
  userInfo?: {
    nickname?: string;
    avatar?: string;
  };
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString()
  refreshToken: string;
}