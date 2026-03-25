import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { UserService } from './user.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/user.dto';

@ApiTags('用户')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  async getProfile(@Request() req: any) {
    return this.userService.findById(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: '更新用户信息' })
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Put(':id/assign-room')
  @ApiOperation({ summary: '分配房间给用户' })
  async assignRoom(@Param('id') id: string, @Body('roomId') roomId: number) {
    return this.userService.assignRoom(parseInt(id), roomId);
  }

  @Get('hotel/:hotelId')
  @ApiOperation({ summary: '获取酒店用户列表' })
  async getUsersByHotel(
    @Param('hotelId') hotelId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.userService.findByHotelId(parseInt(hotelId), page, limit);
  }
}
