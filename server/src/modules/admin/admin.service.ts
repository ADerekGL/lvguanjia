import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, DataSource, LessThan, Between } from 'typeorm';
import * as QRCode from 'qrcode';
import { Cron } from '@nestjs/schedule';
import { Hotel, User, Room, Order, ServiceRequest, Product, ServiceType, SubscriptionOrder, Subscription } from '@/entities';
import { ProductService } from '../product/product.service';
import { SetPrivilegeDto } from './dto/set-privilege.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Hotel) private hotelRepo: Repository<Hotel>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(ServiceRequest) private serviceRepo: Repository<ServiceRequest>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ServiceType) private serviceTypeRepo: Repository<ServiceType>,
    @InjectRepository(Subscription) private subscriptionRepo: Repository<Subscription>,
    private productService: ProductService,
    private dataSource: DataSource,
  ) {}

  async getStats() {
    const [totalHotels] = await Promise.all([
      this.hotelRepo.count(),
    ]);

    const activeHotels = await this.hotelRepo.count({ where: { status: 1 } });
    const totalSubscriptions = await this.subscriptionRepo.count({ where: { status: 'active' } });

    const subRevenueResult = await this.dataSource.getRepository(SubscriptionOrder)
      .createQueryBuilder('o')
      .select('SUM(o.amount)', 'total')
      .where('o.status = :status', { status: 'paid' })
      .getRawOne();

    return {
      totalHotels,
      activeHotels,
      totalSubscriptions,
      subscriptionRevenue: Number(subRevenueResult?.total || 0),
    };
  }

  async getHotels() {
    return this.hotelRepo.find();
  }

  async createHotel(data: any) {
    const hotel = this.hotelRepo.create(data);
    return this.hotelRepo.save(hotel);
  }

  async updateHotel(id: number, data: any) {
    await this.hotelRepo.update(id, data);
    return this.hotelRepo.findOne({ where: { id } });
  }

  async getHotelQrCode(id: number) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?hotelId=${id}`;
    return QRCode.toDataURL(url);
  }

  async generateHotelQrCode(id: number, baseUrl?: string) {
    const url = `${baseUrl || process.env.FRONTEND_URL || 'http://localhost:5173'}/?hotelId=${id}`;
    return QRCode.toDataURL(url);
  }

  async initHotel(id: number, floors: number, roomsPerFloor: number) {
    const hotel = await this.hotelRepo.findOne({ where: { id } });
    if (!hotel) throw new NotFoundException('酒店不存在');

    const rooms: Room[] = [];
    for (let f = 1; f <= floors; f++) {
      for (let r = 1; r <= roomsPerFloor; r++) {
        const roomNumber = `${f}${String(r).padStart(2, '0')}`;
        rooms.push(this.roomRepo.create({
          hotelId: id,
          floor: f,
          roomNumber,
          type: 1,
          price: 299,
          status: 1,
        }));
      }
    }
    await this.roomRepo.save(rooms);
    return { success: true, count: rooms.length };
  }

  async getUsers(page = 1, limit = 20, hotelId?: number) {
    const where: any = { role: 1 };
    if (hotelId) where.hotelId = hotelId;
    const [items, total] = await this.userRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total };
  }

  async updateUser(id: number, data: any) {
    await this.userRepo.update(id, data);
    return this.userRepo.findOne({ where: { id } });
  }

  async getPendingHotelAdmins() {
    return this.userRepo.find({ where: { role: 2, status: 0 }, relations: ['hotel'] });
  }

  async approveHotelAdmin(id: number) {
    await this.userRepo.update(id, { status: 1 });
    return { success: true };
  }

  async rejectHotelAdmin(id: number) {
    await this.userRepo.update(id, { status: 2 });
    return { success: true };
  }

  async getOrders(page = 1, limit = 20, hotelId?: number) {
    const where: any = {};
    if (hotelId) where.hotelId = hotelId;
    const [orders, total] = await this.orderRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['hotel', 'room'],
    });
    return { orders, total };
  }

  async updateOrderStatus(id: number, status: number) {
    await this.orderRepo.update(id, { status });
    return { success: true };
  }

  async getServices(hotelId?: number) {
    const where: any = {};
    if (hotelId) where.hotelId = hotelId;
    return this.serviceRepo.find({ where, order: { createdAt: 'DESC' }, relations: ['hotel', 'room'] });
  }

  async updateServiceStatus(id: number, status: number) {
    await this.serviceRepo.update(id, { status });
    return { success: true };
  }

  async getProducts(hotelId?: number, category?: string) {
    const where: any = {};
    if (hotelId) where.hotelId = hotelId;
    if (category) where.category = category;
    return this.productRepo.find({ where, relations: ['hotel'] });
  }

  async createProduct(data: any) {
    const product = this.productRepo.create(data);
    return this.productRepo.save(product);
  }

  async updateProduct(id: number, data: any) {
    await this.productRepo.update(id, data);
    return this.productRepo.findOne({ where: { id } });
  }

  async deleteProduct(id: number) {
    await this.productRepo.delete(id);
    return { success: true };
  }

  async getRooms(hotelId?: number) {
    const where: any = {};
    if (hotelId) where.hotelId = hotelId;
    return this.roomRepo.find({ where, order: { floor: 'ASC', roomNumber: 'ASC' }, relations: ['hotel'] });
  }

  async getCheckins(hotelId?: number) {
    const where: any = { roomId: Not(IsNull()) };
    if (hotelId) where.hotelId = hotelId;
    return this.userRepo.find({ where, relations: ['hotel', 'room'] });
  }

  async checkIn(data: any) {
    const user = this.userRepo.create({
      ...data,
      role: 1,
      status: 1,
    });
    await this.userRepo.save(user);
    if (data.roomId) {
      await this.roomRepo.update(data.roomId, { status: 2 });
    }
    return user;
  }

  async checkOut(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (user.roomId) {
      await this.roomRepo.update(user.roomId, { status: 1 });
    }
    await this.userRepo.update(userId, { roomId: null as any });
    return { success: true };
  }

  async getPrivilege(hotelId: number) {
    const hotel = await this.hotelRepo.findOne({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('酒店不存在');
    return {
      effectivePlan: hotel.effectivePlan,
      planOverride: hotel.planOverride,
      planOverrideNote: hotel.planOverrideNote,
      planOverrideBy: hotel.planOverrideBy,
      planOverrideAt: hotel.planOverrideAt,
    };
  }

  async setPrivilege(hotelId: number, data: SetPrivilegeDto, operatorId: number) {
    const hotel = await this.hotelRepo.findOne({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('酒店不存在');
    hotel.effectivePlan = data.planName as any;
    hotel.planOverride = true;
    hotel.planOverrideNote = data.reason;
    hotel.planOverrideBy = operatorId;
    hotel.planOverrideAt = new Date();
    await this.hotelRepo.save(hotel);
    return this.getPrivilege(hotelId);
  }

  async revokePrivilege(hotelId: number) {
    const hotel = await this.hotelRepo.findOne({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('酒店不存在');
    hotel.effectivePlan = 'none';
    hotel.planOverride = false;
    hotel.planOverrideNote = null;
    hotel.planOverrideBy = null;
    hotel.planOverrideAt = null;
    await this.hotelRepo.save(hotel);
    return { success: true };
  }

  @Cron('5 0 * * *')
  async handleSubscriptionExpiry() {
    const expired = await this.subscriptionRepo.find({
      where: { status: 'active', expiresAt: LessThan(new Date()) },
      relations: ['plan'],
    });
    for (const sub of expired) {
      sub.status = 'expired';
      await this.subscriptionRepo.save(sub);
      const hotel = await this.hotelRepo.findOne({ where: { id: sub.hotelId } });
      if (!hotel) continue;
      if (!hotel.planOverride) {
        hotel.effectivePlan = 'none';
        await this.hotelRepo.save(hotel);
      }
    }
  }
}