import { Controller, Get, Post, Put, Body, Param, Query, ParseIntPipe, DefaultValuePipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('订单')
@Controller('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('all')
  @ApiOperation({ summary: '管理员获取所有订单' })
  async findAll(
    @Query('hotelId', new DefaultValuePipe(1), ParseIntPipe) hotelId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.orderService.findByHotel(hotelId, page, limit);
  }

  @Put('admin/:id/status')
  @ApiOperation({ summary: '管理员更新订单状态' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', ParseIntPipe) status: number,
  ) {
    return this.orderService.updateStatus(id, status);
  }

  @Post()
  @ApiOperation({ summary: '创建订单' })
  async create(
    @Request() req: any,
    @Body() body: { items: { productId: number; quantity: number }[]; remark?: string },
  ) {
    const { hotelId, roomId, id: userId } = req.user;
    return this.orderService.create(hotelId, roomId, userId, body.items, body.remark);
  }

  @Get()
  @ApiOperation({ summary: '获取我的订单' })
  async findMyOrders(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.orderService.findByRoom(req.user.roomId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取订单详情' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findById(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: '取消订单' })
  async cancel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.orderService.cancel(id, req.user.id);
  }
}
