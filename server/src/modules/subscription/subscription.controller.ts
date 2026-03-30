import {
  Controller, Get, Post, Put, Body, Param, Query,
  ParseIntPipe, DefaultValuePipe, UseGuards, Request,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard';
import { HotelAdminAuthGuard } from '@/common/guards/hotel-admin-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hotel } from '@/entities';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { GrantSubscriptionDto, CancelSubscriptionDto } from './dto/subscription.dto';
import { UpgradePlanDto } from './dto/upgrade.dto';

// ─── Sysadmin: plan management ─────────────────────────────────────────────

@ApiTags('系统管理 - 套餐')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('sysadmin')
export class SysadminSubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: '获取所有套餐列表' })
  @ApiResponse({ status: 200, description: '套餐列表' })
  listPlans() {
    return this.subscriptionService.listPlans();
  }

  @Post('plans')
  @ApiOperation({ summary: '创建套餐（含种子数据）' })
  @ApiResponse({ status: 201, description: '套餐创建成功' })
  createPlan(@Body() dto: CreatePlanDto) {
    return this.subscriptionService.createPlan(dto);
  }

  @Put('plans/:id')
  @ApiOperation({ summary: '更新套餐定价/功能' })
  @ApiParam({ name: 'id', description: '套餐ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '套餐不存在' })
  updatePlan(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlanDto) {
    return this.subscriptionService.updatePlan(id, dto);
  }

  @Get('subscriptions')
  @ApiOperation({ summary: '获取所有酒店订阅列表（分页）' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({ status: 200, description: '订阅列表' })
  listSubscriptions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.subscriptionService.listSubscriptions(page, limit);
  }

  @Get('subscriptions/:hotelId')
  @ApiOperation({ summary: '获取指定酒店的订阅详情' })
  @ApiParam({ name: 'hotelId', description: '酒店ID' })
  @ApiResponse({ status: 200, description: '订阅详情' })
  getSubscription(@Param('hotelId', ParseIntPipe) hotelId: number) {
    return this.subscriptionService.getSubscriptionByHotel(hotelId);
  }

  @Post('subscriptions/:hotelId/grant')
  @ApiOperation({ summary: '手动授权/升级套餐（企业定制合同）' })
  @ApiParam({ name: 'hotelId', description: '酒店ID' })
  @ApiResponse({ status: 201, description: '授权成功' })
  @ApiResponse({ status: 404, description: '套餐不存在' })
  grantSubscription(
    @Param('hotelId', ParseIntPipe) hotelId: number,
    @Body() dto: GrantSubscriptionDto,
  ) {
    return this.subscriptionService.grantSubscription(hotelId, dto);
  }

  @Put('subscriptions/:id/cancel')
  @ApiOperation({ summary: '取消订阅' })
  @ApiParam({ name: 'id', description: '订阅ID' })
  @ApiResponse({ status: 200, description: '取消成功' })
  @ApiResponse({ status: 404, description: '订阅不存在' })
  cancelSubscription(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.cancelSubscription(id);
  }

  @Post('plans/seed')
  @ApiOperation({ summary: '初始化种子套餐数据（仅首次）' })
  @ApiResponse({ status: 201, description: '种子数据写入成功（已存在时跳过）' })
  async seedPlans() {
    await this.subscriptionService.seedPlans();
    return { message: 'ok' };
  }
}

// ─── Hotel-admin: self-service ──────────────────────────────────────────────

@ApiTags('酒店管理 - 订阅')
@ApiBearerAuth()
@UseGuards(HotelAdminAuthGuard)
@Controller('hotel-admin/subscription')
export class HotelAdminSubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @InjectRepository(Hotel) private readonly hotelRepository: Repository<Hotel>,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取我的当前套餐及到期时间' })
  @ApiResponse({ status: 200, description: '当前订阅信息' })
  async getMySubscription(@Request() req) {
    const hotelId = req.user.hotelId;
    const hotel = await this.hotelRepository.findOne({ where: { id: hotelId } });
    const subscription = await this.subscriptionService.getActiveSubscription(hotelId);
    return {
      effectivePlan: hotel?.effectivePlan || 'none',
      planOverride: hotel?.planOverride || false,
      status: subscription?.status || 'none',
      plan: subscription ? {
        name: subscription.plan?.name,
        displayName: subscription.plan?.displayName,
        billingCycle: subscription.billingCycle,
        expiresAt: subscription.expiresAt,
      } : null,
    };
  }

  @Get('plans')
  @ApiOperation({ summary: '获取可购买套餐列表及定价' })
  @ApiResponse({ status: 200, description: '套餐列表' })
  listPlans() {
    return this.subscriptionService.listPlans();
  }

  @Post('upgrade')
  @ApiOperation({ summary: '发起套餐购买（返回支付URL）' })
  @ApiResponse({ status: 201, description: '支付URL及订单ID。企业套餐返回400引导联系销售' })
  @ApiResponse({ status: 400, description: '企业套餐需联系销售' })
  @ApiResponse({ status: 404, description: '套餐不存在' })
  upgrade(@Body() dto: UpgradePlanDto, @Request() req) {
    return this.subscriptionService.initiatePurchase(req.user.hotelId, dto);
  }

  @Get('orders')
  @ApiOperation({ summary: '我的订阅账单历史' })
  @ApiResponse({ status: 200, description: '账单列表' })
  getMyOrders(@Request() req) {
    return this.subscriptionService.getMyOrders(req.user.hotelId);
  }
}
