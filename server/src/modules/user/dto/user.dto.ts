import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: '姓名', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '手机号', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class AssignRoomDto {
  @ApiProperty({ description: '房间ID' })
  @IsNumber()
  roomId: number;
}