import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateServiceRequestDto, UpdateServiceStatusDto } from './dto/service.dto';

@ApiTags('服务')
@Controller('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get('all')
  @UseGuards(PlanGuard)
  @RequireFeature('checkin')
  @ApiOperation({ summary: '管理员获取所有服务请求（按当前用户酒店，可override）' })
  @ApiQuery({ name: 'hotelId', required: false, description: '酒店ID，不传则取JWT中的hotelId' })
  @ApiResponse({ status: 200, description: '服务请求列表' })
  @ApiResponse({ status: 401, description: '未认证' })
  async findAll(@Request() req: any, @Query('hotelId') hotelId?: string) {
    const resolvedHotelId = hotelId ? parseInt(hotelId, 10) : req.user.hotelId;
    return this.serviceService.findByHotel(resolvedHotelId);
  }

  @Get('types')
  @ApiOperation({ summary: '获取当前酒店服务类型列表' })
  @ApiResponse({ status: 200, description: '服务类型列表（按sort排序）' })
  @ApiResponse({ status: 401, description: '未认证' })
  async getTypes(@Request() req: any) {
    return this.serviceService.getServiceTypes(req.user.hotelId);
  }

  @Post('request')
  @ApiOperation({ summary: '提交服务请求（客人）' })
  @ApiResponse({ status: 201, description: '服务请求已提交' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '未认证' })
  async createRequest(
    @Request() req: any,
    @Body() body: CreateServiceRequestDto,
  ) {
    const { hotelId, roomId, id: userId } = req.user;
    return this.serviceService.createRequest(hotelId, roomId, userId, body.typeId, body.description);
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的服务请求历史' })
  @ApiResponse({ status: 200, description: '我的服务请求列表' })
  @ApiResponse({ status: 401, description: '未认证' })
  async findMy(@Request() req: any) {
    return this.serviceService.findByRoom(req.user.roomId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取服务请求详情' })
  @ApiParam({ name: 'id', description: '服务请求ID' })
  @ApiResponse({ status: 200, description: '服务请求详情' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '服务请求不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.findById(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新服务状态（管家操作）' })
  @ApiParam({ name: 'id', description: '服务请求ID' })
  @ApiResponse({ status: 200, description: '状态更新成功，实时通知客人' })
  @ApiResponse({ status: 401, description: '未认证' })
  @ApiResponse({ status: 404, description: '服务请求不存在' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateServiceStatusDto,
    @Request() req: any,
  ) {
    return this.serviceService.updateStatus(id, body.status, req.user.id);
  }
}
