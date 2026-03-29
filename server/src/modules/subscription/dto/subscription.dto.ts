import { IsEnum, IsInt, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GrantSubscriptionDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  planId: number;

  @ApiProperty({ enum: ['monthly', 'annual'], example: 'annual' })
  @IsEnum(['monthly', 'annual'])
  billingCycle: 'monthly' | 'annual';

  @ApiPropertyOptional({ description: 'Days of access to grant', example: 365 })
  @IsInt()
  @IsOptional()
  durationDays?: number;
}

export class CancelSubscriptionDto {
  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  immediate?: boolean; // if true cancel now, else let expire naturally
}
