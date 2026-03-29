import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ description: '商品ID', example: 1 })
  @IsInt()
  @Min(1)
  productId: number;

  @ApiProperty({ description: '数量', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: '订单商品列表', type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: '备注', required: false, example: '请快点送' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  remark?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ description: '订单状态 (1待支付 2已支付 3配送中 4已完成 5已取消)', example: 3 })
  @IsInt()
  @Min(1)
  status: number;
}
