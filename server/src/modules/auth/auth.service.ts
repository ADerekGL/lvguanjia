import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { User, Hotel, Room } from '@/entities';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}

  /**
   * 获取或创建默认酒店
   */
  private async getOrCreateDefaultHotel(): Promise<Hotel> {
    let hotel = await this.hotelRepository.findOne({ where: { status: 1 } });
    if (!hotel) {
      hotel = this.hotelRepository.create({
        name: '智慧酒店',
        address: '示例地址',
        phone: '400-000-0000',
        city: '北京',
        province: '北京',
        status: 1,
      });
      hotel = await this.hotelRepository.save(hotel);

      // 创建默认房间
      const roomData = [
        { floor: 1, roomNumber: '101', type: 1, status: 1, price: 299 },
        { floor: 1, roomNumber: '102', type: 1, status: 1, price: 299 },
        { floor: 2, roomNumber: '201', type: 2, status: 1, price: 399 },
        { floor: 2, roomNumber: '202', type: 2, status: 1, price: 399 },
        { floor: 3, roomNumber: '301', type: 3, status: 1, price: 599 },
      ];
      for (const rd of roomData) {
        await this.roomRepository.save(
          this.roomRepository.create({ ...rd, hotelId: hotel.id }),
        );
      }
    }
    return hotel;
  }

  /**
   * 入住验证登录：房间号 + 手机号后4位
   */
  async verifyCheckin(roomNumber: string, phoneLast4: string): Promise<any> {
    // Find a user with matching room and phone last 4 digits
    const hotel = await this.hotelRepository.findOne({ where: { status: 1 } });
    if (!hotel) throw new UnauthorizedException('酒店不存在');

    const room = await this.roomRepository.findOne({
      where: { hotelId: hotel.id, roomNumber },
    });
    if (!room) throw new UnauthorizedException('房间号不存在');

    const user = await this.userRepository.findOne({
      where: { roomId: room.id, status: 1, role: 1 },
    });
    if (!user) throw new UnauthorizedException('该房间暂无入住信息，请联系前台');

    const phone = user.phone || '';
    if (!phone.endsWith(phoneLast4)) {
      throw new UnauthorizedException('手机号后4位不正确');
    }

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });
    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        roomId: user.roomId,
        hotelId: user.hotelId,
      },
    };
  }

  /**
   * 开发/演示登录（用 phone 作为 openid 标识符）
   */
  async devLogin(name: string, phone: string): Promise<any> {
    const openid = `dev_${phone}`;
    let user = await this.userRepository.findOne({ where: { openid } });

    const hotel = await this.getOrCreateDefaultHotel();

    if (!user) {
      // 找一个空闲房间分配
      const freeRoom = await this.roomRepository.findOne({
        where: { hotelId: hotel.id, status: 1 },
        order: { floor: 'ASC', roomNumber: 'ASC' },
      });

      user = this.userRepository.create({
        openid,
        name,
        phone,
        role: 1,
        status: 1,
        hotelId: hotel.id,
        roomId: freeRoom?.id ?? undefined,
      });
      await this.userRepository.save(user);

      // 将房间标记为入住
      if (freeRoom) {
        await this.roomRepository.update(freeRoom.id, { status: 2 });
      }
    } else {
      if (name) user.name = name;
      if (!user.hotelId) user.hotelId = hotel.id;
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        roomId: user.roomId,
        hotelId: user.hotelId,
        phone: user.phone,
      },
      token,
    };
  }

  /**
   * 微信登录
   */
  async wechatLogin(openid: string, userInfo?: any): Promise<any> {
    let user = await this.userRepository.findOne({ where: { openid } });

    if (!user) {
      // 新用户注册
      user = this.userRepository.create({
        openid,
        name: userInfo?.nickname,
        avatar: userInfo?.avatar,
        role: 1, // 客人
        status: 1,
      });

      // 如果是第一个用户，设为管理员
      const userCount = await this.userRepository.count();
      if (userCount === 0) {
        user.role = 3; // 管理员
      }

      await this.userRepository.save(user);
    } else {
      // 更新最后登录时间
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
    }

    // 生成 token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        roomId: user.roomId,
        hotelId: user.hotelId,
      },
      token,
    };
  }

  /**
   * 生成 JWT Token
   */
  generateToken(user: User): string {
    const payload = {
      sub: user.id,
      openid: user.openid,
      role: user.role,
      roomId: user.roomId,
      hotelId: user.hotelId,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * 验证用户
   */
  async validateUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  /**
   * 刷新 token
   */
  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.validateUser(payload.sub);
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      const newToken = this.generateToken(user);

      return {
        token: newToken,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          roomId: user.roomId,
          hotelId: user.hotelId,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('刷新令牌无效');
    }
  }

  /**
   * 登出
   */
  async logout(userId: number): Promise<boolean> {
    // 实际项目中可能需要将token加入黑名单
    // 这里简单返回成功
    return true;
  }
}