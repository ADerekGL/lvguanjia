import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ example: 'pro' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Pro 会员' })
  @IsString()
  displayName: string;

  @ApiProperty({ example: 999.00 })
  @IsNumber()
  @Min(0)
  priceMonthly: number;

  @ApiProperty({ example: 9990.00 })
  @IsNumber()
  @Min(0)
  priceAnnual: number;

  @ApiProperty({ example: ['checkin', 'qrcode', 'ai'] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ example: 'Pro 会员' })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({ example: 999.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMonthly?: number;

  @ApiPropertyOptional({ example: 9990.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceAnnual?: number;

  @ApiPropertyOptional({ example: ['checkin', 'qrcode', 'ai'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
