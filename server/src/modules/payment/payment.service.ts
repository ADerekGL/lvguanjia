import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AlipaySdk } from 'alipay-sdk';
import { Payment, Order } from '@/entities';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class PaymentService {
  private alipaySdk: AlipaySdk | null = null;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private configService: ConfigService,
    private subscriptionService: SubscriptionService,
  ) {
    if (this.configService.get<boolean>('features.paymentEnabled')) {
      this.alipaySdk = new AlipaySdk({
        appId: this.configService.get<string>('payment.alipay.appId') ?? '',
        privateKey: this.configService.get<string>('payment.alipay.privateKey') ?? '',
        alipayPublicKey: this.configService.get<string>('payment.alipay.publicKey'),
        gateway: this.configService.get<string>('payment.alipay.gateway') || 'https://openapi.alipay.com/gateway.do',
      });
    }
  }

  async createPayment(
    orderId: number,
    userId: number,
    channel: number,
  ): Promise<{ payUrl: string; transactionId: string; mock: boolean }> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== 1) throw new BadRequestException('订单状态不允许支付');

    // Check for existing pending payment
    const existing = await this.paymentRepository.findOne({
      where: { orderId, status: 0 },
    });
    if (existing) {
      return { payUrl: existing.transactionId, transactionId: existing.transactionId, mock: false };
    }

    const paymentEnabled = this.configService.get<boolean>('features.paymentEnabled');

    if (paymentEnabled && this.alipaySdk && channel === 2) {
      return this.createAlipayH5(order);
    }

    // Mock payment (dev / WeChat Pay not yet configured)
    return this.mockConfirm(order, channel);
  }

  private async createAlipayH5(
    order: Order,
  ): Promise<{ payUrl: string; transactionId: string; mock: boolean }> {
    const notifyUrl = this.configService.get<string>('payment.alipay.notifyUrl');
    const returnUrl = this.configService.get<string>('payment.alipay.returnUrl');

    const result = await this.alipaySdk!.exec('alipay.trade.wap.pay', {
      notify_url: notifyUrl,
      return_url: returnUrl,
      bizContent: {
        out_trade_no: order.orderNo,
        total_amount: Number(order.totalAmount).toFixed(2),
        subject: `智慧酒店订单 ${order.orderNo}`,
        product_code: 'QUICK_WAP_WAY',
      },
    }, { validateSign: false });

    // alipay.trade.wap.pay returns HTML form; we return the URL form for H5
    const payUrl = result as unknown as string;

    // Create a pending payment record
    const payment = this.paymentRepository.create({
      orderId: order.id,
      transactionId: order.orderNo,
      amount: order.totalAmount,
      channel: 2,
      status: 0, // pending
      paidAt: null,
    });
    await this.paymentRepository.save(payment);

    return { payUrl, transactionId: order.orderNo, mock: false };
  }

  private async mockConfirm(
    order: Order,
    channel: number,
  ): Promise<{ payUrl: string; transactionId: string; mock: boolean }> {
    const transactionId = `MOCK${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    await this.confirmPayment(transactionId, order.id, order.totalAmount, channel);
    return { payUrl: '', transactionId, mock: true };
  }

  async handleAlipayNotify(params: Record<string, string>): Promise<boolean> {
    if (!this.alipaySdk) return false;

    const valid = this.alipaySdk.checkNotifySign(params);
    if (!valid) return false;

    if (params.trade_status !== 'TRADE_SUCCESS' && params.trade_status !== 'TRADE_FINISHED') {
      return true; // ACK but don't process
    }

    const outTradeNo: string = params.out_trade_no;

    // Route subscription orders (tradeNo starts with 'SUB')
    if (this.subscriptionService.isSubscriptionTradeNo(outTradeNo)) {
      return this.subscriptionService.handleSubscriptionPaid(outTradeNo);
    }

    const order = await this.orderRepository.findOne({ where: { orderNo: outTradeNo } });
    if (!order || order.status !== 1) return true;

    await this.confirmPayment(
      params.trade_no,
      order.id,
      parseFloat(params.total_amount),
      2,
    );
    return true;
  }

  async confirmPayment(
    transactionId: string,
    orderId: number,
    amount: number,
    channel: number,
  ): Promise<Payment> {
    // Upsert: update existing pending record or create new
    let payment = await this.paymentRepository.findOne({ where: { orderId } });
    if (payment) {
      payment.transactionId = transactionId;
      payment.amount = amount;
      payment.channel = channel;
      payment.status = 1;
      payment.paidAt = new Date();
    } else {
      payment = this.paymentRepository.create({
        orderId,
        transactionId,
        amount,
        channel,
        status: 1,
        paidAt: new Date(),
      });
    }
    const saved = await this.paymentRepository.save(payment);
    await this.orderRepository.update(orderId, { status: 2, paidAt: new Date() });
    return saved;
  }

  async getReceipt(orderId: number, userId: number): Promise<object> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['items', 'payments', 'room', 'hotel'],
    });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status < 2) throw new BadRequestException('订单未支付，无法生成收据');

    const payment = order.payments?.[0];
    return {
      receiptNo: `RCP${order.orderNo}`,
      orderNo: order.orderNo,
      hotelName: order.hotel?.name || '',
      roomNumber: order.room?.roomNumber || '',
      items: (order.items || []).map((i) => ({
        name: i.productName,
        price: Number(i.price),
        quantity: i.quantity,
        subtotal: Number(i.subtotal),
      })),
      totalAmount: Number(order.totalAmount),
      paidAt: payment?.paidAt || order.paidAt,
      channel: payment?.channel === 2 ? '支付宝' : payment?.channel === 1 ? '微信支付' : '其他',
      transactionId: payment?.transactionId || '',
    };
  }

  async findByOrder(orderId: number): Promise<Payment[]> {
    return this.paymentRepository.find({ where: { orderId }, order: { createdAt: 'DESC' } });
  }

  /**
   * WeChat Pay async notify stub.
   * BLOCKED: Requires WECHAT_PAY_API_KEY + real signature verification.
   * Currently marks payment confirmed if orderId found in body.
   */
  async handleWechatNotify(params: Record<string, string>): Promise<boolean> {
    // TODO: implement real WxPay signature verification when keys are available
    const outTradeNo = params['out_trade_no'];
    const resultCode = params['result_code'];
    if (!outTradeNo || resultCode !== 'SUCCESS') return false;
    const payment = await this.paymentRepository.findOne({ where: { transactionId: outTradeNo } });
    if (!payment) return false;
    await this.paymentRepository.update(payment.id, { status: 1, paidAt: new Date() });
    await this.orderRepository.update(payment.orderId, { status: 2, paidAt: new Date() });
    return true;
  }
}
