import { IsEnum, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpgradePlanDto {
  @ApiProperty({ description: 'Plan ID to upgrade to', example: 2 })
  @IsInt()
  planId: number;

  @ApiProperty({ enum: ['monthly', 'annual'], example: 'monthly' })
  @IsEnum(['monthly', 'annual'])
  billingCycle: 'monthly' | 'annual';

  @ApiProperty({ enum: ['alipay', 'wechat'], example: 'alipay' })
  @IsEnum(['alipay', 'wechat'])
  paymentMethod: 'alipay' | 'wechat';
}
