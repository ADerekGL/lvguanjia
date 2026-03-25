import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Hotel } from './hotel.entity';
import { Room } from './room.entity';
import { User } from './user.entity';
import { ServiceType } from './service-type.entity';

@Entity('service_request')
export class ServiceRequest {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'hotel_id', type: 'bigint' })
  hotelId: number;

  @Column({ name: 'room_id', type: 'bigint' })
  roomId: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'type_id', type: 'bigint' })
  typeId: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 1-待处理，2-处理中，3-已完成，4-已取消

  @Column({ name: 'handler_id', type: 'bigint', nullable: true })
  handlerId: number;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 关系
  @ManyToOne(() => Hotel, (hotel) => hotel.serviceTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @ManyToOne(() => Room, (room) => room.serviceRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => User, (user) => user.serviceRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ServiceType, (type) => type.serviceRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'type_id' })
  type: ServiceType;

  @ManyToOne(() => User, (user) => user.handledServices, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'handler_id' })
  handler: User;
}