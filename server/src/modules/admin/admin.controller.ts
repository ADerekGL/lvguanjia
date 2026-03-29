import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe, DefaultValuePipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard';
import { SetPrivilegeDto } from './dto/set-privilege.dto';

@ApiTags('系统管理')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('sysadmin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: '全平台统计数据（酒店数、用户数、收入等）' })
  @ApiResponse({ status: 200, description: '统计数据' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('hotels')
  @ApiOperation({ summary: '获取所有酒店列表' })
  @ApiResponse({ status: 200, description: '酒店列表' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getHotels() {
    return this.adminService.getHotels();
  }

  @Post('hotels')
  @ApiOperation({ summary: '创建酒店' })
  @ApiBody({ schema: { example: { name: '示范大酒店', address: '北京市朝阳区xx路1号', phone: '010-12345678', city: '北京', province: '北京' } } })
  @ApiResponse({ status: 201, description: '酒店创建成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  createHotel(@Body() body: any) {
    return this.adminService.createHotel(body);
  }

  @Put('hotels/:id')
  @ApiOperation({ summary: '更新酒店信息' })
  @ApiParam({ name: 'id', description: '酒店ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '酒店不存在' })
  updateHotel(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminService.updateHotel(id, body);
  }

  @Post('hotels/:id/init')
  @ApiOperation({ summary: '初始化酒店房间和服务类型（按楼层批量创建）' })
  @ApiParam({ name: 'id', description: '酒店ID' })
  @ApiBody({ schema: { example: { floors: 10, roomsPerFloor: 8 } } })
  @ApiResponse({ status: 201, description: '初始化成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  initHotel(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { floors: number; roomsPerFloor: number },
  ) {
    return this.adminService.initHotel(id, body.floors, body.roomsPerFloor);
  }

  @Get('hotels/:id/qrcode')
  @ApiOperation({ summary: '获取酒店入住二维码（Data URI PNG）' })
  @ApiParam({ name: 'id', description: '酒店ID' })
  @ApiResponse({ status: 200, description: '返回 { dataUri: string, url: string }' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getHotelQrCode(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:8080';
    const baseUrl = `${proto}://${host.replace(/:\d+$/, '')}:80`;
    return this.adminService.generateHotelQrCode(id, baseUrl);
  }

  @Get('users')
  @ApiOperation({ summary: '获取平台用户列表（分页）' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'hotelId', required: false, description: '按酒店过滤' })
  @ApiResponse({ status: 200, description: '用户列表及总数' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('hotelId') hotelId?: string,
  ) {
    return this.adminService.getUsers(page, limit, hotelId ? parseInt(hotelId) : undefined);
  }

  @Put('users/:id')
  @ApiOperation({ summary: '更新用户信息（角色/状态）' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminService.updateUser(id, body);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: '禁用用户（status=0）' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '禁用成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.updateUser(id, { status: 0 });
  }

  @Get('hotel-admins/pending')
  @ApiOperation({ summary: '获取待审核的酒店管理员注册列表' })
  @ApiResponse({ status: 200, description: '待审核列表' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getPendingHotelAdmins() {
    return this.adminService.getPendingHotelAdmins();
  }

  @Put('hotel-admins/:id/approve')
  @ApiOperation({ summary: '审核通过酒店管理员注册' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '审核通过，用户和酒店均激活' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  approveHotelAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.approveHotelAdmin(id);
  }

  @Put('hotel-admins/:id/reject')
  @ApiOperation({ summary: '拒绝酒店管理员注册' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '已拒绝' })
  @ApiResponse({ status: 403, description: '权限不足' })
  rejectHotelAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.rejectHotelAdmin(id);
  }

  @Get('orders')
  @ApiOperation({ summary: '获取平台订单列表（分页）' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'hotelId', required: false, description: '按酒店过滤' })
  @ApiResponse({ status: 200, description: '订单列表及总数' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('hotelId') hotelId?: string,
  ) {
    return this.adminService.getOrders(page, limit, hotelId ? parseInt(hotelId) : undefined);
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: '更新订单状态' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiBody({ schema: { example: { status: 3 } } })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  updateOrderStatus(@Param('id', ParseIntPipe) id: number, @Body('status', ParseIntPipe) status: number) {
    return this.adminService.updateOrderStatus(id, status);
  }

  @Get('services')
  @ApiOperation({ summary: '获取平台服务请求列表' })
  @ApiQuery({ name: 'hotelId', required: false, description: '按酒店过滤' })
  @ApiResponse({ status: 200, description: '服务请求列表' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getServices(@Query('hotelId') hotelId?: string) {
    return this.adminService.getServices(hotelId ? parseInt(hotelId) : undefined);
  }

  @Put('services/:id/status')
  @ApiOperation({ summary: '更新服务请求状态' })
  @ApiParam({ name: 'id', description: '服务请求ID' })
  @ApiBody({ schema: { example: { status: 2 } } })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  updateServiceStatus(@Param('id', ParseIntPipe) id: number, @Body('status', ParseIntPipe) status: number) {
    return this.adminService.updateServiceStatus(id, status);
  }

  @Get('products')
  @ApiOperation({ summary: '获取商品列表' })
  @ApiQuery({ name: 'hotelId', required: false, description: '按酒店过滤' })
  @ApiQuery({ name: 'category', required: false, description: '按分类过滤' })
  @ApiResponse({ status: 200, description: '商品列表' })
  @ApiResponse({ status: 403, description: '权限不足' })
  getProducts(@Query('hotelId') hotelId?: string, @Query('category') category?: string) {
    return this.adminService.getProducts(hotelId ? parseInt(hotelId) : undefined, category);
  }

  @Post('products')
  @ApiOperation({ summary: '创建商品' })
  @ApiResponse({ status: 201, description: '商品创建成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  createProduct(@Body() body: any) {
    return this.adminService.createProduct(body);
  }

  @Put('products/:id')
  @ApiOperation({ summary: '更新商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.adminService.updateProduct(id, body);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: '删除商品' })
  @ApiParam({ name: 'id', description: '商品ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 403, description: '权限不足' })
  deleteProduct(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProduct(id);
  }

  // ─── Privilege management ────────────────────────────────────────────

  @Get('hotels/:hotelId/privilege')
  @ApiOperation({ summary: '查看酒店权益（effectivePlan + 订阅详情 + override信息）' })
  @ApiParam({ name: 'hotelId', description: '酒店ID' })
  @ApiResponse({ status: 200, description: '权益信息' })
  @ApiResponse({ status: 404, description: '酒店不存在' })
  getPrivilege(@Param('hotelId', ParseIntPipe) hotelId: number) {
    return this.adminService.getPrivilege(hotelId);
  }

  @Put('hotels/:hotelId/privilege')
  @ApiOperation({ summary: '手动设置酒店套餐等级（override）' })
  @ApiParam({ name: 'hotelId', description: '酒店ID' })
  @ApiBody({ type: SetPrivilegeDto })
  @ApiResponse({ status: 200, description: '设置成功' })
  @ApiResponse({ status: 404, description: '酒店不存在' })
  setPrivilege(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Body() dto: SetPrivilegeDto,
    @Request() req: any,
  ) {
    return this.adminService.setPrivilege(hotelId, dto, req.user.id);
  }

  @Post('hotels/:hotelId/privilege/revoke')
  @ApiOperation({ summary: '立即撤销酒店套餐（降为 none/未订阅）' })
  @ApiParam({ name: 'hotelId', description: '酒店ID' })
  @ApiResponse({ status: 200, description: '撤销成功' })
  @ApiResponse({ status: 404, description: '酒店不存在' })
  revokePrivilege(@Param('hotelId', ParseIntPipe) hotelId: number) {
    return this.adminService.revokePrivilege(hotelId);
  }
}
