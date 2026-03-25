import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('支付')
@Controller('payment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('pay')
  @ApiOperation({ summary: '发起支付' })
  async pay(
    @Body() body: { orderId: number; channel: number },
  ) {
    return this.paymentService.createPayment(body.orderId, body.channel);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: '获取订单支付记录' })
  async findByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentService.findByOrder(orderId);
  }
}
