import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import {
  WechatLoginDto,
  RefreshTokenDto,
  VerifyCheckinDto,
  AdminLoginDto,
  DevLoginDto,
  RegisterGuestDto,
  RegisterHotelAdminDto,
  LoginDto,
} from './dto/auth.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-checkin')
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '入住验证登录（房间号 + 手机后4位）' })
  @ApiResponse({ status: 200, description: '登录成功，返回JWT token' })
  @ApiResponse({ status: 401, description: '房间号或手机后4位不匹配' })
  @ApiResponse({ status: 429, description: '请求过于频繁（60秒内最多5次）' })
  async verifyCheckin(@Body() body: VerifyCheckinDto) {
    return this.authService.verifyCheckin(body.roomNumber, body.phoneLast4, body.hotelId ? Number(body.hotelId) : undefined);
  }

  @Post('register-hotel-admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '酒店管理员注册（含酒店信息，待审核）' })
  @ApiResponse({ status: 201, description: '注册成功，待系统管理员审核' })
  @ApiResponse({ status: 401, description: '手机号已注册' })
  async registerHotelAdmin(@Body() body: RegisterHotelAdminDto) {
    return this.authService.registerHotelAdmin(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '手机号 + 密码登录（客人 & 酒店管理员）' })
  @ApiResponse({ status: 200, description: '登录成功，返回JWT token' })
  @ApiResponse({ status: 401, description: '手机号或密码错误，或账号待审核' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.phone, body.password);
  }

  @Post('admin-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '系统管理员登录（用户名 + 密码）' })
  @ApiResponse({ status: 200, description: '登录成功，返回JWT token' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async adminLogin(@Body() body: AdminLoginDto) {
    return this.authService.adminLogin(body.username, body.password);
  }

  @Post('hotel-admin-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '酒店管理员登录（用户名 + 密码）' })
  @ApiResponse({ status: 200, description: '登录成功，返回JWT token' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async hotelAdminLogin(@Body() body: AdminLoginDto) {
    return this.authService.hotelAdminLogin(body.username, body.password);
  }

  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '开发用登录（仅限开发环境，手机号标识用户）' })
  @ApiResponse({ status: 200, description: '登录成功，返回JWT token' })
  async devLogin(@Body() body: DevLoginDto) {
    return this.authService.devLogin(body.name, body.phone);
  }

  @Post('wechat-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信小程序登录（code换取openid）' })
  @ApiResponse({ status: 200, description: '登录成功，返回JWT token' })
  @ApiResponse({ status: 401, description: 'code无效或已过期' })
  async wechatLogin(@Body() wechatLoginDto: WechatLoginDto) {
    return this.authService.wechatLoginWithCode(wechatLoginDto.code, wechatLoginDto.userInfo);
  }

  @Get('wechat-oauth')
  @ApiOperation({ summary: '发起微信网页OAuth授权（重定向到微信）' })
  @ApiQuery({ name: 'hotelId', required: false, description: '酒店ID，用于授权后关联酒店' })
  @ApiResponse({ status: 302, description: '重定向到微信授权页' })
  wechatOAuth(@Query('hotelId') hotelId: string, @Res() res: Response) {
    const url = this.authService.getWechatOAuthUrl(hotelId);
    res.redirect(url);
  }

  @Get('wechat-callback')
  @ApiOperation({ summary: '微信网页OAuth回调（由微信服务器调用）' })
  @ApiQuery({ name: 'code', required: true, description: '微信返回的授权code' })
  @ApiQuery({ name: 'state', required: false, description: '透传的state参数（含hotelId）' })
  @ApiResponse({ status: 302, description: '重定向到前端，携带token参数' })
  @ApiResponse({ status: 401, description: 'code无效' })
  async wechatCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const { token, frontendUrl } = await this.authService.handleWechatCallback(code, state);
    res.redirect(`${frontendUrl}/auth-callback?token=${token}`);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '使用刷新令牌换取新的访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功，返回新token' })
  @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '退出登录' })
  @ApiResponse({ status: 200, description: '退出成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Post('self-checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '客人自助退房（确认已还房卡后退房）' })
  @ApiResponse({ status: 200, description: '退房成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 400, description: '未入住或已退房' })
  async selfCheckout(@Request() req) {
    return this.authService.selfCheckout(req.user.id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前登录用户信息' })
  @ApiResponse({ status: 200, description: '返回用户信息' })
  @ApiResponse({ status: 401, description: '未认证' })
  async getProfile(@Request() req) {
    return { user: req.user };
  }
}
