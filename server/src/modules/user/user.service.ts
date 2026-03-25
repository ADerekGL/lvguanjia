import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '@/entities';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 根据ID查找用户
   */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * findOne别名方法，用于兼容
   */
  async findOne(id: number): Promise<User | null> {
    return this.findById(id);
  }

  /**
   * 根据openid查找用户
   */
  async findByOpenid(openid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { openid } });
  }

  /**
   * 更新用户信息
   */
  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(userId, updateUserDto);
    return this.findById(userId);
  }

  /**
   * 分配房间给用户
   */
  async assignRoom(userId: number, roomId: number): Promise<User | null> {
    await this.userRepository.update(userId, { roomId });
    return this.findById(userId);
  }

  /**
   * 获取用户列表（按酒店）
   */
  async findByHotelId(
    hotelId: number,
    page = 1,
    limit = 10,
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      where: { hotelId },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });

    return { users, total };
  }
}