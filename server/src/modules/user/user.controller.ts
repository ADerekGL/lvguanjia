import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

import { UserService } from './user.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UpdateUserDto, AssignRoomDto } from './dto/user.dto';

@ApiTags('用户')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取当前登录用户详细信息' })
  @ApiResponse({ status: 200, description: '用户信息' })
  @ApiResponse({ status: 401, description: '未认证' })
  async getProfile(@Request() req: any) {
    return this.userService.findById(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: '更新当前用户信息（姓名/手机/头像）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(req.user.id, updateUserDto);
  }

  @Put(':id/assign-room')
  @ApiOperation({ summary: '给用户分配房间（管理员操作）' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '分配成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '用户或房间不存在' })
  async assignRoom(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AssignRoomDto,
  ) {
    return this.userService.assignRoom(id, body.roomId);
  }

  @Get('hotel/:hotelId')
  @ApiOperation({ summary: '获取酒店用户列表' })
  @ApiParam({ name: 'hotelId', description: '酒店ID' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiResponse({ status: 200, description: '用户列表' })
  @ApiResponse({ status: 401, description: '未认证' })
  async getUsersByHotel(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.userService.findByHotelId(hotelId, page, limit);
  }
}
