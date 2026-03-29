import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Room } from './room.entity';
import { Product } from './product.entity';
import { Order } from './order.entity';
import { ServiceType } from './service-type.entity';

@Entity('hotel')
export class Hotel {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  province: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 0-停业，1-营业

  @Column({ name: 'effective_plan', type: 'varchar', length: 16, default: 'none' })
  effectivePlan: string; // 'none' | 'basic' | 'pro' | 'enterprise'

  @Column({ name: 'plan_override', type: 'boolean', default: false })
  planOverride: boolean;

  @Column({ name: 'plan_override_note', type: 'varchar', length: 255, nullable: true })
  planOverrideNote: string | null;

  @Column({ name: 'plan_override_by', type: 'int', nullable: true })
  planOverrideBy: number | null;

  @Column({ name: 'plan_override_at', type: 'timestamp', nullable: true })
  planOverrideAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @OneToMany(() => User, (user) => user.hotel)
  users: User[];

  @OneToMany(() => Room, (room) => room.hotel)
  rooms: Room[];

  @OneToMany(() => Product, (product) => product.hotel)
  products: Product[];

  @OneToMany(() => Order, (order) => order.hotel)
  orders: Order[];

  @OneToMany(() => ServiceType, (serviceType) => serviceType.hotel)
  serviceTypes: ServiceType[];
}