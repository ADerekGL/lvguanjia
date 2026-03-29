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
import { Room } from './room.entity';
import { Message } from './message.entity';
import { Order } from './order.entity';
import { ServiceRequest } from './service-request.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'hotel_id', type: 'bigint', nullable: true })
  hotelId: number;

  @Column({ name: 'room_id', type: 'bigint', nullable: true })
  roomId: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  openid: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  unionid: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'tinyint', default: 1 })
  role: number; // 1-客人，2-管家，3-管理员

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 0-禁用，1-正常

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash: string;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => Hotel, (hotel) => hotel.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @ManyToOne(() => Room, (room) => room.users, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => ServiceRequest, (serviceRequest) => serviceRequest.user)
  serviceRequests: ServiceRequest[];

  @OneToMany(() => ServiceRequest, (serviceRequest) => serviceRequest.handler)
  handledServices: ServiceRequest[];
}