import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

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
  async verifyCheckin(roomNumber: string, phoneLast4: string, hotelId?: number): Promise<any> {
    let hotel: Hotel;
    if (hotelId) {
      hotel = await this.hotelRepository.findOne({ where: { id: hotelId, status: 1 } }) as Hotel;
      if (!hotel) throw new UnauthorizedException('酒店不存在或已停业');
    } else {
      hotel = await this.hotelRepository.findOne({ where: { status: 1 } }) as Hotel;
      if (!hotel) throw new UnauthorizedException('酒店不存在');
    }

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
  async wechatLogin(openid: string, userInfo?: any, hotelId?: number): Promise<any> {
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
   * 微信网页授权 OAuth URL
   */
  getWechatOAuthUrl(hotelId?: string): string {
    const appid = this.configService.get<string>('wechat.appid');
    const redirectUri = encodeURIComponent(
      this.configService.get<string>('app.url') + '/api/auth/wechat-callback',
    );
    const state = hotelId ? `hotelId_${hotelId}` : 'default';
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`;
  }

  /**
   * 微信回调：用 code 换 openid，创建/更新用户，返回 JWT
   */
  async handleWechatCallback(code: string, state: string): Promise<{ token: string; frontendUrl: string }> {
    const frontendUrl = this.configService.get<string>('app.frontendUrl') ?? '/';
    const wechatEnabled = this.configService.get<boolean>('features.wechatLoginEnabled');

    let openid: string;
    let nickname: string | undefined;
    let avatar: string | undefined;

    if (wechatEnabled) {
      const appid = this.configService.get<string>('wechat.appid');
      const secret = this.configService.get<string>('wechat.secret');
      const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`;
      const tokenRes = await fetch(tokenUrl).then((r) => r.json()) as any;
      if (tokenRes.errcode) throw new UnauthorizedException('微信授权失败: ' + tokenRes.errmsg);
      openid = tokenRes.openid;
      const infoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenRes.access_token}&openid=${openid}&lang=zh_CN`;
      const info = await fetch(infoUrl).then((r) => r.json()) as any;
      nickname = info.nickname;
      avatar = info.headimgurl;
    } else {
      openid = `mock_wx_${code}_${Date.now()}`;
    }

    const hotelId = state?.startsWith('hotelId_') ? parseInt(state.replace('hotelId_', '')) : undefined;
    const result = await this.wechatLogin(openid, { nickname, avatar }, hotelId);
    return { token: result.token, frontendUrl };
  }

  /**
   * 微信登录（code 换 openid，供 POST /auth/wechat-login 使用）
   */
  async wechatLoginWithCode(code: string, userInfo?: any): Promise<any> {
    const wechatEnabled = this.configService.get<boolean>('features.wechatLoginEnabled');
    let openid: string;
    if (wechatEnabled && code) {
      const appid = this.configService.get<string>('wechat.appid');
      const secret = this.configService.get<string>('wechat.secret');
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
      const res = await fetch(url).then((r) => r.json()) as any;
      if (res.errcode) throw new UnauthorizedException('微信登录失败: ' + res.errmsg);
      openid = res.openid;
    } else {
      openid = `mock_openid_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    return this.wechatLogin(openid, userInfo);
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
   * 管理员登录（用户名 + 密码）
   * username 对应 user.phone，password 对比 bcrypt hash 存在 user.openid 字段
   * 或直接用预设的 superadmin 账号
   */
  async adminLogin(username: string, password: string): Promise<any> {
    const configUsername = this.configService.get<string>('admin.username');
    const configPassword = this.configService.get<string>('admin.password');

    if (username !== configUsername || password !== configPassword) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // Find or auto-create the admin user record
    let user = await this.userRepository.findOne({ where: { role: 3, status: 1 } });
    if (!user) {
      const hotel = await this.getOrCreateDefaultHotel();
      user = await this.userRepository.save(
        this.userRepository.create({
          openid: `admin_${configUsername}`,
          name: '系统管理员',
          role: 3,
          status: 1,
          hotelId: hotel.id,
        }),
      );
    }

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });
    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        hotelId: user.hotelId,
      },
    };
  }

  async hotelAdminLogin(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { phone: username, role: 2, status: 1 },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });
    const token = this.generateToken(user);
    return {
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role, hotelId: user.hotelId },
    };
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
   * 用户注册（客人，role=1）
   */
  async registerGuest(name: string, phone: string, password: string): Promise<any> {
    const existing = await this.userRepository.findOne({ where: { phone } });
    if (existing) throw new UnauthorizedException('该手机号已注册');

    const passwordHash = await bcrypt.hash(password, 10);
    const openid = `phone_${phone}`;
    const user = await this.userRepository.save(
      this.userRepository.create({
        name,
        phone,
        passwordHash,
        openid,
        role: 1,
        status: 1,
      }),
    );

    const token = this.generateToken(user);
    return {
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
    };
  }

  /**
   * 酒店管理员注册（role=2，status=0 待审核）
   */
  async registerHotelAdmin(dto: {
    name: string;
    phone: string;
    password: string;
    hotelName: string;
    hotelAddress: string;
    hotelCity?: string;
    hotelProvince?: string;
    hotelPhone?: string;
  }): Promise<any> {
    const existing = await this.userRepository.findOne({ where: { phone: dto.phone } });
    if (existing) throw new UnauthorizedException('该手机号已注册');

    // Create hotel (status=0 pending)
    const hotel = await this.hotelRepository.save(
      this.hotelRepository.create({
        name: dto.hotelName,
        address: dto.hotelAddress,
        city: dto.hotelCity,
        province: dto.hotelProvince,
        phone: dto.hotelPhone,
        status: 0, // pending approval
      }),
    );

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const openid = `phone_${dto.phone}`;
    const user = await this.userRepository.save(
      this.userRepository.create({
        name: dto.name,
        phone: dto.phone,
        passwordHash,
        openid,
        role: 2,
        status: 0, // pending approval
        hotelId: hotel.id,
      }),
    );

    return {
      message: '注册成功，请等待系统管理员审核',
      userId: user.id,
      hotelId: hotel.id,
    };
  }

  /**
   * 手机号 + 密码登录（客人 role=1 或 酒店管理员 role=2）
   */
  async login(phone: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { phone },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    if (user.status === 0) {
      throw new UnauthorizedException('账号待审核，请联系管理员');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('手机号或密码错误');

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });
    const token = this.generateToken(user);
    return {
      token,
      user: { id: user.id, name: user.name, phone: user.phone, role: user.role, hotelId: user.hotelId },
    };
  }

  /**
   * 登出
   */
  async logout(userId: number): Promise<boolean> {
    return true;
  }

  /**
   * 客人自助退房
   */
  async selfCheckout(userId: number): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOne({ where: { id: userId, role: 1, status: 1 } });
    if (!user) throw new UnauthorizedException('未入住或已退房');
    await this.userRepository.update(user.id, { status: 0, roomId: null as any });
    if (user.roomId) {
      await this.roomRepository.update({ id: user.roomId }, { status: 1 });
    }
    return { success: true };
  }
}