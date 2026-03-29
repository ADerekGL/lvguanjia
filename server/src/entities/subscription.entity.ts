import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Hotel } from './hotel.entity';
import { Plan } from './plan.entity';
import { SubscriptionOrder } from './subscription-order.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'hotel_id' })
  hotelId: number;

  @Column({ name: 'plan_id' })
  planId: number;

  @Column({ name: 'billing_cycle', type: 'varchar', length: 16 })
  billingCycle: 'monthly' | 'annual';

  @Column({ type: 'varchar', length: 16, default: 'trial' })
  status: 'active' | 'expired' | 'cancelled' | 'trial';

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ name: 'auto_renew', type: 'boolean', default: true })
  autoRenew: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Hotel)
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @ManyToOne(() => Plan, (p) => p.subscriptions)
  @JoinColumn({ name: 'plan_id' })
  plan: Plan;

  @OneToMany(() => SubscriptionOrder, (o) => o.subscription)
  orders: SubscriptionOrder[];
}
