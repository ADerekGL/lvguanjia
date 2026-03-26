import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('系统管理')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: '系统统计数据' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('hotels')
  @ApiOperation({ summary: '获取所有酒店' })
  getHotels() {
    return this.adminService.getHotels();
  }

  @Post('hotels')
  @ApiOperation({ summary: '创建酒店' })
  createHotel(@Body() body: any) {
    return this.adminService.createHotel(body);
  }

  @Put('hotels/:id')
  @ApiOperation({ summary: '更新酒店' })
  updateHotel(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminService.updateHotel(id, body);
  }

  @Get('users')
  @ApiOperation({ summary: '获取所有用户' })
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('hotelId') hotelId?: string,
    @Query('role') role?: string,
  ) {
    return this.adminService.getUsers(
      page, limit,
      hotelId ? parseInt(hotelId) : undefined,
      role ? parseInt(role) : undefined,
    );
  }

  @Put('users/:id')
  @ApiOperation({ summary: '更新用户角色/状态' })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role?: number; status?: number },
  ) {
    return this.adminService.updateUser(id, body);
  }

  @Get('orders')
  @ApiOperation({ summary: '获取所有订单' })
  getOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('hotelId') hotelId?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getOrders(
      page, limit,
      hotelId ? parseInt(hotelId) : undefined,
      status ? parseInt(status) : undefined,
    );
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: '更新订单状态' })
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', ParseIntPipe) status: number,
  ) {
    return this.adminService.updateOrderStatus(id, status);
  }

  @Get('services')
  @ApiOperation({ summary: '获取所有服务请求' })
  getServices(
    @Query('hotelId') hotelId?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getServices(
      hotelId ? parseInt(hotelId) : undefined,
      status ? parseInt(status) : undefined,
    );
  }

  @Put('services/:id/status')
  @ApiOperation({ summary: '更新服务请求状态' })
  updateServiceStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', ParseIntPipe) status: number,
  ) {
    return this.adminService.updateServiceStatus(id, status);
  }

  @Get('rooms')
  @ApiOperation({ summary: '获取所有房间' })
  getRooms(@Query('hotelId') hotelId?: string) {
    return this.adminService.getRooms(hotelId ? parseInt(hotelId) : undefined);
  }

  @Put('rooms/:id/status')
  @ApiOperation({ summary: '更新房间状态' })
  updateRoomStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', ParseIntPipe) status: number,
  ) {
    return this.adminService.updateRoomStatus(id, status);
  }

  @Post('checkin')
  @ApiOperation({ summary: '为房间办理入住（上传客人信息）' })
  checkIn(@Body() body: { hotelId: number; roomNumber: string; name: string; phone: string }) {
    return this.adminService.checkIn(body);
  }

  @Delete('checkin/:userId')
  @ApiOperation({ summary: '办理退房（删除客人入住信息）' })
  checkOut(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.checkOut(userId);
  }

  @Get('checkins')
  @ApiOperation({ summary: '获取当前所有在住客人' })
  getCheckins(@Query('hotelId') hotelId?: string) {
    return this.adminService.getCheckins(hotelId ? parseInt(hotelId) : undefined);
  }
}
