import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '@/entities';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async getRoomHistory(roomId: number, limit = 50, offset = 0): Promise<Message[]> {
    return this.messageRepository.find({
      where: { roomId },
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
      relations: ['sender'],
    });
  }

  async create(data: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(data);
    return this.messageRepository.save(message);
  }

  async countUnread(roomId: number, userId: number): Promise<number> {
    return this.messageRepository.count({
      where: { roomId, receiverId: userId, isRead: 0 },
    });
  }
}
