import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { WechatLoginDto, RefreshTokenDto } from './dto/auth.dto';

class DevLoginDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;
}

class VerifyCheckinDto {
  @IsString()
  roomNumber: string;

  @IsString()
  phoneLast4: string;
}

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-checkin')
  @ApiOperation({ summary: '入住验证登录（房间号 + 手机后4位）' })
  async verifyCheckin(@Body() body: VerifyCheckinDto) {
    return this.authService.verifyCheckin(body.roomNumber, body.phoneLast4);
  }

  @Post('dev-login')
  @ApiOperation({ summary: '开发登录（用手机号标识用户）' })
  async devLogin(@Body() body: DevLoginDto) {
    return this.authService.devLogin(body.name, body.phone);
  }

  @Post('wechat-login')
  @ApiOperation({ summary: '微信登录' })
  async wechatLogin(@Body() wechatLoginDto: WechatLoginDto) {
    const { code, userInfo } = wechatLoginDto;
    const mockOpenid = `mock_openid_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    return this.authService.wechatLogin(mockOpenid, userInfo);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: '刷新令牌' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req) {
    return { user: req.user };
  }
}
