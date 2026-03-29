import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Hotel } from './hotel.entity';
import { Plan } from './plan.entity';
import { Subscription } from './subscription.entity';

@Entity('subscription_orders')
export class SubscriptionOrder {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'hotel_id' })
  hotelId: number;

  @Column({ name: 'subscription_id', nullable: true })
  subscriptionId: number;

  @Column({ name: 'plan_id' })
  planId: number;

  @Column({ name: 'billing_cycle', type: 'varchar', length: 16 })
  billingCycle: 'monthly' | 'annual';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status: 'pending' | 'paid' | 'failed' | 'refunded';

  @Column({ name: 'payment_method', type: 'varchar', length: 16, nullable: true })
  paymentMethod: 'alipay' | 'wechat' | 'manual';

  @Column({ name: 'trade_no', type: 'varchar', length: 64, nullable: true })
  tradeNo: string; // Alipay out_trade_no

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @ManyToOne(() => Plan, (p) => p.orders)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @ManyToOne(() => Subscription, (s) => s.orders)
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;
}
