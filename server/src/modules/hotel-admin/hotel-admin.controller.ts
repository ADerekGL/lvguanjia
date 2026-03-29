import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, DefaultValuePipe, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { HotelAdminService } from './hotel-admin.service';
import { HotelAdminAuthGuard } from '@/common/guards/hotel-admin-auth.guard';

@ApiTags('酒店管理')
@ApiBearerAuth()
@UseGuards(HotelAdminAuthGuard)
@Controller('hotel-admin')
export class HotelAdminController {
  constructor(private readonly hotelAdminService: HotelAdminService) {}

  @Get('stats')
  @ApiOperation({ summary: '当前酒店统计数据（房间数、用户数、订单数、待处理服务数、收入）' })
  @ApiResponse({ status: 200, description: '统计数据' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getStats(@Request() req) {
    return this.hotelAdminService.getStats(req.user.hotelId);
  }

  @Get('rooms')
  @ApiOperation({ summary: '获取当前酒店房间列表（按楼层/房间号排序）' })
  @ApiResponse({ status: 200, description: '房间列表' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getRooms(@Request() req) {
    return this.hotelAdminService.getRooms(req.user.hotelId);
  }

  @Put('rooms/:id/status')
  @ApiOperation({ summary: '更新房间状态（1空闲 2已入住 3清洁中 4维修中）' })
  @ApiParam({ name: 'id', description: '房间ID' })
  @ApiBody({ schema: { example: { status: 3 } } })
  @ApiResponse({ status: 200, description: '状态更新成功' })
  @ApiResponse({ status: 403, description: '权限不足或房间不属于该酒店' })
  updateRoomStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: number,
    @Request() req,
  ) {
    return this.hotelAdminService.updateRoomStatus(id, status, req.user.hotelId);
  }

  @Get('users')
  @ApiOperation({ summary: '获取当前酒店用户（在住客人）列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiResponse({ status: 200, description: '用户列表及总数' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getUsers(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.hotelAdminService.getUsers(req.user.hotelId, page, limit);
  }

  @Put('users/:id')
  @ApiOperation({ summary: '更新用户信息（限当前酒店用户）' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '权限不足或用户不属于该酒店' })
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Request() req,
  ) {
    return this.hotelAdminService.updateUser(id, req.user.hotelId, body);
  }

  @Get('orders')
  @ApiOperation({ summary: '获取当前酒店订单列表（分页）' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiResponse({ status: 200, description: '订单列表及总数' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getOrders(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.hotelAdminService.getOrders(req.user.hotelId, page, limit);
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: '更新订单状态（限当前酒店订单）' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ schema: { example: { status: 3 } } })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', ParseIntPipe) status: number,
    @Request() req,
  ) {
    return this.hotelAdminService.updateOrderStatus(id, req.user.hotelId, status);
  }

  @Get('services')
  @ApiOperation({ summary: '获取当前酒店服务请求列表' })
  @ApiResponse({ status: 200, description: '服务请求列表' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getServices(@Request() req) {
    return this.hotelAdminService.getServices(req.user.hotelId);
  }

  @Put('services/:id/status')
  @ApiOperation({ summary: '更新服务请求状态（限当前酒店）' })
  @ApiParam({ name: 'id', description: '服务请求ID' })
  @ApiBody({ schema: { example: { status: 2 } } })
  @ApiResponse({ status: 200, description: '更新成功，实时通知客人' })
  @ApiResponse({ status: 403, description: '权限不足' })
  updateServiceStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', ParseIntPipe) status: number,
    @Request() req,
  ) {
    return this.hotelAdminService.updateServiceStatus(id, req.user.hotelId, status);
  }

  @Get('products')
  @ApiOperation({ summary: '获取当前酒店商品列表' })
  @ApiResponse({ status: 200, description: '商品列表' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getProducts(@Request() req) {
    return this.hotelAdminService.getProducts(req.user.hotelId);
  }

  @Post('products')
  @ApiOperation({ summary: '创建商品（自动关联当前酒店）' })
  @ApiResponse({ status: 201, description: '商品创建成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  createProduct(@Body() body: any, @Request() req) {
    return this.hotelAdminService.createProduct(req.user.hotelId, body);
  }

  @Put('products/:id')
  @ApiOperation({ summary: '更新商品（限当前酒店）' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Request() req) {
    return this.hotelAdminService.updateProduct(id, req.user.hotelId, body);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: '删除商品（限当前酒店）' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  deleteProduct(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.hotelAdminService.deleteProduct(id, req.user.hotelId);
  }

  @Get('checkins')
  @ApiOperation({ summary: '获取当前酒店入住列表' })
  @ApiResponse({ status: 200, description: '在住客人列表' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getCheckins(@Request() req) {
    return this.hotelAdminService.getCheckins(req.user.hotelId);
  }

  @Post('checkin')
  @ApiOperation({ summary: '办理入住（为客人创建账号并分配房间）' })
  @ApiBody({ schema: { example: { name: '张三', phone: '13800138000', roomId: 5 } } })
  @ApiResponse({ status: 201, description: '入住成功，返回新建用户信息' })
  @ApiResponse({ status: 400, description: '该房间已有入住客人' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async createCheckin(@Body() body: any, @Request() req) {
    try {
      return await this.hotelAdminService.createCheckin(req.user.hotelId, body);
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete('checkin/:userId')
  @ApiOperation({ summary: '办理退房（清除用户房间关联，释放房间）' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @ApiResponse({ status: 200, description: '退房成功' })
  @ApiResponse({ status: 400, description: '用户不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async deleteCheckin(@Param('userId', ParseIntPipe) userId: number, @Request() req) {
    try {
      return await this.hotelAdminService.deleteCheckin(userId, req.user.hotelId);
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
}
