import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { SubscriptionOrder } from './subscription-order.entity';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 32, unique: true })
  name: string; // 'basic' | 'pro' | 'enterprise'

  @Column({ name: 'display_name', type: 'varchar', length: 64 })
  displayName: string;

  @Column({ name: 'price_monthly', type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceMonthly: number;

  @Column({ name: 'price_annual', type: 'decimal', precision: 10, scale: 2, default: 0 })
  priceAnnual: number;

  @Column({ type: 'json' })
  features: string[]; // e.g. ['checkin', 'qrcode', 'ai']

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Subscription, (s) => s.plan)
  subscriptions: Subscription[];

  @OneToMany(() => SubscriptionOrder, (o) => o.plan)
  orders: SubscriptionOrder[];
}
