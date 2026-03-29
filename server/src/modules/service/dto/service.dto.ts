import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min, MaxLength, IsOptional } from 'class-validator';

export class CreateServiceRequestDto {
  @ApiProperty({ description: '服务类型ID', example: 1 })
  @IsInt()
  @Min(1)
  typeId: number;

  @ApiProperty({ description: '描述', example: '请送一套牙刷牙膏' })
  @IsString()
  @MaxLength(500)
  description: string;
}

export class UpdateServiceStatusDto {
  @ApiProperty({ description: '服务状态 (1待处理 2处理中 3已完成 4已取消)', example: 2, enum: [1, 2, 3, 4] })
  @IsInt()
  @Min(1)
  status: number;
}
