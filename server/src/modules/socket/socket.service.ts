import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Message, User } from '@/entities';
import { UserService } from '../user/user.service';

@Injectable()
export class SocketService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  /**
   * 验证 WebSocket 连接令牌
   */
  async validateToken(token: string): Promise<any> {
    if (!token) {
      return null;
    }

    try {
      // 移除 "Bearer " 前缀
      const actualToken = token.replace('Bearer ', '');

      // 验证 JWT
      const payload = this.jwtService.verify(actualToken, {
        secret: this.configService.get('jwt.secret'),
      });

      // 获取用户信息
      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        roomId: user.roomId,
        hotelId: user.hotelId,
      };
    } catch (error) {
      console.error('Token验证失败:', error);
      return null;
    }
  }

  /**
   * 保存消息到数据库
   */
  async saveMessage(data: {
    roomId: number;
    senderId: number;
    receiverId?: number;
    content: string;
    type: number;
  }): Promise<Message> {
    const message = this.messageRepository.create({
      roomId: data.roomId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: data.content,
      type: data.type,
      isRead: 0, // 未读
    });

    return await this.messageRepository.save(message);
  }

  /**
   * 获取房间历史消息
   */
  async getRoomMessages(roomId: number, limit: number = 50): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { roomId, receiverId: undefined }, // 群聊消息
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['sender'],
    });
  }

  /**
   * 获取私聊历史消息
   */
  async getPrivateMessages(
    senderId: number,
    receiverId: number,
    limit: number = 50,
  ): Promise<Message[]> {
    return await this.messageRepository.find({
      where: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['sender'],
    });
  }

  /**
   * 标记消息为已读
   */
  async markAsRead(messageIds: number[]): Promise<void> {
    if (messageIds.length === 0) return;
    await this.messageRepository.update(
      { id: In(messageIds) },
      { isRead: 1 },
    );
  }
}