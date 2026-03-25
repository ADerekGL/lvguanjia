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
import { User } from './user.entity';
import { Message } from './message.entity';
import { Order } from './order.entity';
import { ServiceRequest } from './service-request.entity';

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'hotel_id', type: 'bigint' })
  hotelId: number;

  @Column({ type: 'int' })
  floor: number;

  @Column({ name: 'room_number', type: 'varchar', length: 10 })
  roomNumber: string;

  @Column({ type: 'tinyint', default: 1 })
  type: number; // 1-标准间，2-大床房，3-套房

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 0-维修，1-空闲，2-入住

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @OneToMany(() => User, (user) => user.room)
  users: User[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];

  @OneToMany(() => Order, (order) => order.room)
  orders: Order[];

  @OneToMany(() => ServiceRequest, (serviceRequest) => serviceRequest.room)
  serviceRequests: ServiceRequest[];
}