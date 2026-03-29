import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard';
import { CreateRoomDto, UpdateRoomStatusDto } from './dto/room.dto';

@ApiTags('房间')
@Controller('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('hotel/:hotelId')
  @ApiOperation({ summary: '获取酒店所有房间' })
  @ApiParam({ name: 'hotelId', description: '酒店ID' })
  @ApiResponse({ status: 200, description: '房间列表' })
  @ApiResponse({ status: 401, description: '未认证' })
  async findByHotel(@Param('hotelId', ParseIntPipe) hotelId: number) {
    return this.roomService.findByHotelId(hotelId);
  }

  @Get('hotel/:hotelId/available')
  @ApiOperation({ summary: '获取酒店可用（空闲）房间' })
  @ApiParam({ name: 'hotelId', description: '酒店ID' })
  @ApiResponse({ status: 200, description: '可用房间列表' })
  @ApiResponse({ status: 401, description: '未认证' })
  async findAvailable(@Param('hotelId', ParseIntPipe) hotelId: number) {
    return this.roomService.findAvailable(hotelId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取房间详情' })
  @ApiParam({ name: 'id', description: '房间ID' })
  @ApiResponse({ status: 200, description: '房间详情' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '房间不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findById(id);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: '创建房间（仅系统管理员）' })
  @ApiResponse({ status: 201, description: '房间创建成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 403, description: '权限不足，需要系统管理员角色' })
  async create(@Body() body: CreateRoomDto) {
    return this.roomService.create(body);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新房间状态（管理员/管家）' })
  @ApiParam({ name: 'id', description: '房间ID' })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRoomStatusDto,
  ) {
    return this.roomService.updateStatus(id, body.status);
  }
}
