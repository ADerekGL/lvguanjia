import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, DefaultValuePipe, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('服务')
@Controller('services')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get('all')
  @ApiOperation({ summary: '管理员获取所有服务请求' })
  async findAll(@Query('hotelId', new DefaultValuePipe(1), ParseIntPipe) hotelId: number) {
    return this.serviceService.findByHotel(hotelId);
  }

  @Get('types')
  @ApiOperation({ summary: '获取服务类型列表' })
  async getTypes(@Request() req: any) {
    return this.serviceService.getServiceTypes(req.user.hotelId);
  }

  @Post('request')
  @ApiOperation({ summary: '提交服务请求' })
  async createRequest(
    @Request() req: any,
    @Body() body: { typeId: number; description: string },
  ) {
    const { hotelId, roomId, id: userId } = req.user;
    return this.serviceService.createRequest(hotelId, roomId, userId, body.typeId, body.description);
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的服务请求' })
  async findMy(@Request() req: any) {
    return this.serviceService.findByRoom(req.user.roomId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取服务请求详情' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceService.findById(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新服务状态（管家用）' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: number },
    @Request() req: any,
  ) {
    return this.serviceService.updateStatus(id, body.status, req.user.id);
  }
}
