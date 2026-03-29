import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, Request, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreatePaymentDto } from './dto/payment.dto';
import type { Request as ExpressRequest } from 'express';

@ApiTags('支付')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('pay')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '发起支付（channel: 1=微信, 2=支付宝）' })
  @ApiResponse({ status: 201, description: '返回支付跳转URL及交易号。FEATURE_PAYMENT_ENABLED=false时返回mock数据' })
  @ApiResponse({ status: 400, description: '订单状态不允许支付或已有待支付记录' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async pay(
    @Body() body: CreatePaymentDto,
    @Request() req: any,
  ) {
    return this.paymentService.createPayment(body.orderId, req.user.id, body.channel);
  }

  @Post('alipay-notify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '支付宝异步回调（由支付宝服务器调用，非前端调用）' })
  @ApiResponse({ status: 200, description: '返回 "success" 或 "fail"' })
  async alipayNotify(@Req() req: ExpressRequest) {
    const params = req.body as Record<string, string>;
    const ok = await this.paymentService.handleAlipayNotify(params);
    return ok ? 'success' : 'fail';
  }

  @Post('wechat-notify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信支付异步回调（由微信服务器调用）— BLOCKED: 待接入真实密钥后实现验签' })
  @ApiResponse({ status: 200, description: '返回XML格式应答' })
  async wechatNotify(@Req() req: ExpressRequest) {
    const params = req.body as Record<string, string>;
    const ok = await this.paymentService.handleWechatNotify(params);
    return ok ? '<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>' : '<xml><return_code><![CDATA[FAIL]]></return_code></xml>';
  }

  @Get('receipt/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取订单收据' })
  @ApiParam({ name: 'orderId', description: '订单ID' })
  @ApiResponse({ status: 200, description: '收据详情（订单号、房间、商品明细、支付渠道）' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '订单不存在或未支付' })
  async getReceipt(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Request() req: any,
  ) {
    return this.paymentService.getReceipt(orderId, req.user.id);
  }

  @Get('order/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取订单支付记录列表' })
  @ApiParam({ name: 'orderId', description: '订单ID' })
  @ApiResponse({ status: 200, description: '支付记录列表（含渠道、状态、时间）' })
  @ApiResponse({ status: 401, description: '未认证' })
  async findByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentService.findByOrder(orderId);
  }
}
