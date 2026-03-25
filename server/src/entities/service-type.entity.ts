import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Hotel } from './hotel.entity';
import { ServiceRequest } from './service-request.entity';

@Entity('service_type')
export class ServiceType {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'hotel_id', type: 'bigint' })
  hotelId: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 0-禁用，1-启用

  @Column({ type: 'int', default: 0 })
  sort: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 关系
  @ManyToOne(() => Hotel, (hotel) => hotel.serviceTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @OneToMany(() => ServiceRequest, (serviceRequest) => serviceRequest.type)
  serviceRequests: ServiceRequest[];
}