import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe, DefaultValuePipe, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@ApiTags('订单')
@Controller('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('all')
  @ApiOperation({ summary: '管理员获取酒店所有订单' })
  @ApiQuery({ name: 'hotelId', required: false, description: '酒店ID，默认1', example: 1 })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiResponse({ status: 200, description: '订单列表及总数' })
  @ApiResponse({ status: 401, description: '未认证' })
  async findAll(
    @Query('hotelId', new DefaultValuePipe(1), ParseIntPipe) hotelId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.orderService.findByHotel(hotelId, page, limit);
  }

  @Put('admin/:id/status')
  @ApiOperation({ summary: '管理员更新订单状态' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, body.status);
  }

  @Post()
  @ApiOperation({ summary: '创建订单（客人下单）' })
  @ApiResponse({ status: 201, description: '订单创建成功' })
  @ApiResponse({ status: 400, description: '商品不存在或库存不足' })
  @ApiResponse({ status: 401, description: '未认证' })
  async create(
    @Request() req: any,
    @Body() body: CreateOrderDto,
  ) {
    const { hotelId, roomId, id: userId } = req.user;
    return this.orderService.create(hotelId, roomId, userId, body.items, body.remark);
  }

  @Get()
  @ApiOperation({ summary: '获取我的订单（按当前用户房间）' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiResponse({ status: 200, description: '我的订单列表' })
  @ApiResponse({ status: 401, description: '未认证' })
  async findMyOrders(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.orderService.findByRoom(req.user.roomId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiResponse({ status: 200, description: '订单详情' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findById(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: '取消订单（仅限待支付状态）' })
  @ApiParam({ name: 'id', description: '订单ID' })
  @ApiResponse({ status: 200, description: '取消成功，库存已恢复' })
  @ApiResponse({ status: 400, description: '订单状态不允许取消' })
  @ApiResponse({ status: 401, description: '未认证或无权操作' })
  async cancel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.orderService.cancel(id, req.user.id);
  }
}
