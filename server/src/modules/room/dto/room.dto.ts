import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ description: '酒店ID', example: 1 })
  @IsInt()
  @Min(1)
  hotelId: number;

  @ApiProperty({ description: '楼层', example: 3 })
  @IsInt()
  @Min(1)
  floor: number;

  @ApiProperty({ description: '房间号', example: '301' })
  @IsString()
  @MaxLength(20)
  roomNumber: string;

  @ApiProperty({ description: '房型 (1标准间 2大床房 3套房)', example: 1, enum: [1, 2, 3] })
  @IsInt()
  type: number;

  @ApiProperty({ description: '价格（元/晚）', example: 399 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateRoomStatusDto {
  @ApiProperty({ description: '房间状态 (1空闲 2已入住 3清洁中 4维修中)', example: 2, enum: [1, 2, 3, 4] })
  @IsInt()
  status: number;
}
