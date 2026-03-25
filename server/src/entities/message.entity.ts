import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { User } from './user.entity';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ name: 'room_id', type: 'bigint' })
  roomId: number;

  @Column({ name: 'sender_id', type: 'bigint' })
  senderId: number;

  @Column({ name: 'receiver_id', type: 'bigint', nullable: true })
  receiverId: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'tinyint', default: 1 })
  type: number; // 1-文本，2-图片，3-语音，4-订单通知，5-服务通知

  @Column({ name: 'is_read', type: 'tinyint', default: 0 })
  isRead: number; // 0-未读，1-已读

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // 关系
  @ManyToOne(() => Room, (room) => room.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @ManyToOne(() => User, (user) => user.sentMessages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;
}