import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsIn } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ description: '订单ID', example: 1 })
  @IsInt()
  @Min(1)
  orderId: number;

  @ApiProperty({ description: '支付渠道 (1=微信 2=支付宝)', example: 2, enum: [1, 2] })
  @IsInt()
  @IsIn([1, 2], { message: '支付渠道只支持 1=微信 或 2=支付宝' })
  channel: number;
}
