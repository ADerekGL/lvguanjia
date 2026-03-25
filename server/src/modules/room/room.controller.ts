import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoomService } from './room.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('房间')
@Controller('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get('hotel/:hotelId')
  @ApiOperation({ summary: '获取酒店所有房间' })
  async findByHotel(@Param('hotelId', ParseIntPipe) hotelId: number) {
    return this.roomService.findByHotelId(hotelId);
  }

  @Get('hotel/:hotelId/available')
  @ApiOperation({ summary: '获取可用房间' })
  async findAvailable(@Param('hotelId', ParseIntPipe) hotelId: number) {
    return this.roomService.findAvailable(hotelId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取房间详情' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.roomService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建房间' })
  async create(@Body() body: any) {
    return this.roomService.create(body);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新房间状态' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
  ) {
    return this.roomService.updateStatus(id, status);
  }
}
