import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, Order } from '@/entities';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async createPayment(orderId: number, channel: number): Promise<{ payUrl: string; transactionId: string }> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== 1) throw new BadRequestException('订单状态不允许支付');

    // 模拟支付结果（实际项目中接入微信支付/支付宝）
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const payUrl = `https://pay.example.com/pay?order=${order.orderNo}&amount=${order.totalAmount}`;

    // 模拟支付成功，实际应由回调触发
    await this.confirmPayment(transactionId, orderId, order.totalAmount, channel);

    return { payUrl, transactionId };
  }

  async confirmPayment(transactionId: string, orderId: number, amount: number, channel: number): Promise<Payment> {
    const payment = this.paymentRepository.create({
      orderId,
      transactionId,
      amount,
      channel,
      status: 1,
      paidAt: new Date(),
    });
    const saved = await this.paymentRepository.save(payment);
    await this.orderRepository.update(orderId, { status: 2, paidAt: new Date() });
    return saved;
  }

  async findByOrder(orderId: number): Promise<Payment[]> {
    return this.paymentRepository.find({ where: { orderId }, order: { createdAt: 'DESC' } });
  }
}
