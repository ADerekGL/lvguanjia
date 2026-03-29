import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AlipaySdk } from 'alipay-sdk';
import { Plan, Subscription, SubscriptionOrder } from '@/entities';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';
import { GrantSubscriptionDto } from './dto/subscription.dto';
import { UpgradePlanDto } from './dto/upgrade.dto';

@Injectable()
export class SubscriptionService {
  private alipaySdk: AlipaySdk | null = null;

  constructor(
    @InjectRepository(Plan)
    private planRepository: Repository<Plan>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionOrder)
    private orderRepository: Repository<SubscriptionOrder>,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    if (this.configService.get<boolean>('features.paymentEnabled')) {
      this.alipaySdk = new AlipaySdk({
        appId: this.configService.get<string>('payment.alipay.appId') ?? '',
        privateKey: this.configService.get<string>('payment.alipay.privateKey') ?? '',
        alipayPublicKey: this.configService.get<string>('payment.alipay.publicKey'),
        gateway:
          this.configService.get<string>('payment.alipay.gateway') ||
          'https://openapi.alipay.com/gateway.do',
      });
    }
  }

  // ─── Plan management ───────────────────────────────────────────────

  async listPlans(): Promise<Plan[]> {
    return this.planRepository.find({ where: { isActive: true }, order: { id: 'ASC' } });
  }

  async createPlan(dto: CreatePlanDto): Promise<Plan> {
    const plan = this.planRepository.create(dto);
    return this.planRepository.save(plan);
  }

  async updatePlan(id: number, dto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.planRepository.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('套餐不存在');
    Object.assign(plan, dto);
    return this.planRepository.save(plan);
  }

  // ─── Active subscription lookup (used by PlanGuard) ────────────────

  async getActiveSubscription(hotelId: number): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { hotelId, status: 'active' },
      relations: ['plan'],
      order: { expiresAt: 'DESC' },
    });
  }

  async hasFeature(hotelId: number, feature: string): Promise<boolean> {
    const sub = await this.getActiveSubscription(hotelId);
    if (!sub) return false;
    return (sub.plan.features as string[]).includes(feature);
  }

  // ─── Sysadmin subscription management ──────────────────────────────

  async listSubscriptions(page: number, limit: number) {
    const [items, total] = await this.subscriptionRepository.findAndCount({
      relations: ['plan', 'hotel'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit };
  }

  async getSubscriptionByHotel(hotelId: number): Promise<Subscription | null> {
    return this.subscriptionRepository.findOne({
      where: { hotelId },
      relations: ['plan', 'orders'],
      order: { createdAt: 'DESC' },
    });
  }

  async grantSubscription(hotelId: number, dto: GrantSubscriptionDto): Promise<Subscription> {
    const plan = await this.planRepository.findOne({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('套餐不存在');

    if (plan.name === 'enterprise') {
      throw new BadRequestException('企业套餐请联系销售，email: sales@lvguanjia.com');
    }

    const durationDays = dto.durationDays ?? (dto.billingCycle === 'annual' ? 365 : 30);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 86400_000);

    // Deactivate existing active subscription
    await this.subscriptionRepository.update(
      { hotelId, status: 'active' },
      { status: 'cancelled' },
    );

    const sub = this.subscriptionRepository.create({
      hotelId,
      planId: plan.id,
      billingCycle: dto.billingCycle,
      status: 'active',
      startedAt: now,
      expiresAt,
      autoRenew: false,
    });
    const saved = await this.subscriptionRepository.save(sub);

    // Record manual order
    await this.orderRepository.save(
      this.orderRepository.create({
        hotelId,
        subscriptionId: saved.id,
        planId: plan.id,
        billingCycle: dto.billingCycle,
        amount: dto.billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly,
        status: 'paid',
        paymentMethod: 'manual',
        paidAt: now,
      }),
    );

    return saved;
  }

  async cancelSubscription(id: number): Promise<Subscription> {
    const sub = await this.subscriptionRepository.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('订阅不存在');
    sub.status = 'cancelled';
    sub.autoRenew = false;
    return this.subscriptionRepository.save(sub);
  }

  // ─── Hotel-admin self-service ───────────────────────────────────────

  async getMySubscription(hotelId: number) {
    const sub = await this.subscriptionRepository.findOne({
      where: { hotelId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
    return sub ?? { status: 'none', plan: null };
  }

  async getMyOrders(hotelId: number): Promise<SubscriptionOrder[]> {
    return this.orderRepository.find({
      where: { hotelId },
      relations: ['plan'],
      order: { createdAt: 'DESC' },
    });
  }

  async initiatePurchase(
    hotelId: number,
    dto: UpgradePlanDto,
  ): Promise<{ payUrl: string; orderId: number; mock: boolean }> {
    const plan = await this.planRepository.findOne({ where: { id: dto.planId, isActive: true } });
    if (!plan) throw new NotFoundException('套餐不存在');

    if (plan.name === 'enterprise') {
      throw new BadRequestException(
        JSON.stringify({ message: 'Please contact sales', email: 'sales@lvguanjia.com' }),
      );
    }

    const amount =
      dto.billingCycle === 'annual'
        ? Number(plan.priceAnnual)
        : Number(plan.priceMonthly);

    if (amount <= 0) {
      throw new BadRequestException('该套餐价格不支持在线购买，请联系销售');
    }

    const tradeNo = `SUB${hotelId}${Date.now()}`;

    const order = await this.orderRepository.save(
      this.orderRepository.create({
        hotelId,
        planId: plan.id,
        billingCycle: dto.billingCycle,
        amount,
        status: 'pending',
        paymentMethod: dto.paymentMethod,
        tradeNo,
      }),
    );

    const paymentEnabled = this.configService.get<boolean>('features.paymentEnabled');
    if (!paymentEnabled || !this.alipaySdk) {
      // Mock mode
      return {
        payUrl: `https://mock-pay.lvguanjia.com/sub?tradeNo=${tradeNo}&amount=${amount}`,
        orderId: order.id,
        mock: true,
      };
    }

    const notifyUrl = this.configService.get<string>('payment.alipay.notifyUrl') || '';
    const result = await (this.alipaySdk as any).exec('alipay.trade.wap.pay', {
      notify_url: notifyUrl,
      bizContent: {
        out_trade_no: tradeNo,
        total_amount: amount.toFixed(2),
        subject: `${plan.displayName} - ${dto.billingCycle === 'annual' ? '年付' : '月付'}`,
        product_code: 'QUICK_WAP_WAY',
      },
    });

    return { payUrl: result as string, orderId: order.id, mock: false };
  }

  // ─── Called from payment notify handler ────────────────────────────

  async handleSubscriptionPaid(tradeNo: string): Promise<boolean> {
    const order = await this.orderRepository.findOne({
      where: { tradeNo },
      relations: ['plan'],
    });
    if (!order || order.status === 'paid') return false;

    await this.dataSource.transaction(async (manager) => {
      // Mark order paid
      await manager.update(SubscriptionOrder, order.id, {
        status: 'paid',
        paidAt: new Date(),
      });

      // Deactivate existing active subscription
      await manager.update(
        Subscription,
        { hotelId: order.hotelId, status: 'active' },
        { status: 'cancelled' },
      );

      // Create / extend subscription
      const now = new Date();
      const durationDays = order.billingCycle === 'annual' ? 365 : 30;
      const expiresAt = new Date(now.getTime() + durationDays * 86400_000);

      const sub = manager.create(Subscription, {
        hotelId: order.hotelId,
        planId: order.planId,
        billingCycle: order.billingCycle,
        status: 'active',
        startedAt: now,
        expiresAt,
        autoRenew: true,
      });
      const savedSub = await manager.save(Subscription, sub);

      // Link order to subscription
      await manager.update(SubscriptionOrder, order.id, { subscriptionId: savedSub.id });
    });

    return true;
  }

  isSubscriptionTradeNo(tradeNo: string): boolean {
    return tradeNo.startsWith('SUB');
  }

  // ─── Seeding ────────────────────────────────────────────────────────

  async seedPlans(): Promise<void> {
    const count = await this.planRepository.count();
    if (count > 0) return;

    await this.planRepository.save([
      this.planRepository.create({
        name: 'basic',
        displayName: '普通会员',
        priceMonthly: 299,
        priceAnnual: 2990,
        features: ['checkin', 'qrcode'],
      }),
      this.planRepository.create({
        name: 'pro',
        displayName: 'Pro 会员',
        priceMonthly: 999,
        priceAnnual: 9990,
        features: ['checkin', 'qrcode', 'ai', 'analytics', 'reports'],
      }),
      this.planRepository.create({
        name: 'enterprise',
        displayName: '企业会员',
        priceMonthly: 0,
        priceAnnual: 0,
        features: ['checkin', 'qrcode', 'ai', 'analytics', 'reports', 'custom'],
      }),
    ]);
  }
}
