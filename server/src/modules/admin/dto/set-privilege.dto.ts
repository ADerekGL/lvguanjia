import { IsIn, IsString, MinLength, MaxLength, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetPrivilegeDto {
  @ApiProperty({ enum: ['none', 'basic', 'pro', 'enterprise'], description: '目标套餐等级' })
  @IsIn(['none', 'basic', 'pro', 'enterprise'])
  planName: string;

  @ApiProperty({ description: '操作原因（必填）', minLength: 4, maxLength: 255 })
  @IsString()
  @MinLength(4)
  @MaxLength(255)
  reason: string;

  @ApiPropertyOptional({ description: '手动指定到期时间（ISO 日期，无订阅时生效）' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
