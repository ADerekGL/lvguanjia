import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, MinLength, MaxLength, Matches, IsEmail, IsInt } from 'class-validator';

export class WechatLoginDto {
  @ApiProperty({ description: '微信登录code', example: '021abc...' })
  @IsString()
  code: string;

  @ApiProperty({ description: '用户信息', required: false })
  @IsOptional()
  @IsObject()
  userInfo?: {
    nickname?: string;
    avatar?: string;
  };
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌', example: 'eyJhbGci...' })
  @IsString()
  refreshToken: string;
}

export class VerifyCheckinDto {
  @ApiProperty({ description: '房间号', example: '101' })
  @IsString()
  @MaxLength(20)
  roomNumber: string;

  @ApiProperty({ description: '手机后4位', example: '1234' })
  @IsString()
  @Matches(/^\d{4}$/, { message: '手机后4位必须是4位数字' })
  phoneLast4: string;

  @ApiProperty({ description: '酒店ID（多酒店场景）', required: false, example: 1 })
  @IsOptional()
  hotelId?: number;
}

export class AdminLoginDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: '密码', example: 'your_password' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

export class DevLoginDto {
  @ApiProperty({ description: '姓名（仅开发环境）', example: '张三' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '手机号（仅开发环境）', example: '13800138000' })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效手机号' })
  phone: string;
}

export class RegisterGuestDto {
  @ApiProperty({ description: '姓名', example: '张三' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效手机号' })
  phone: string;

  @ApiProperty({ description: '密码（至少6位）', example: 'abc123' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}

export class RegisterHotelAdminDto {
  @ApiProperty({ description: '姓名', example: '李四' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '手机号（作为登录名）', example: '13900139000' })
  @IsString()
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入有效手机号' })
  phone: string;

  @ApiProperty({ description: '密码（至少6位）', example: 'abc123' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({ description: '酒店名称', example: '示范大酒店' })
  @IsString()
  @MaxLength(100)
  hotelName: string;

  @ApiProperty({ description: '酒店地址', example: '北京市朝阳区xx路1号' })
  @IsString()
  @MaxLength(255)
  hotelAddress: string;

  @ApiProperty({ description: '城市', example: '北京', required: false })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  hotelCity?: string;

  @ApiProperty({ description: '省份', example: '北京', required: false })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  hotelProvince?: string;

  @ApiProperty({ description: '酒店联系电话', example: '010-12345678', required: false })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  hotelPhone?: string;
}

export class LoginDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  phone: string;

  @ApiProperty({ description: '密码', example: 'abc123' })
  @IsString()
  @MinLength(6)
  password: string;
}
