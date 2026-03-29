import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, DataSource, LessThan } from 'typeorm';
import * as QRCode from 'qrcode';
import { Cron } from '@nestjs/schedule';
import { Hotel, User, Room, Order, ServiceRequest, Product, ServiceType } from '@/entities';
import { Subscription } from '@/entities';
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
    const [totalHotels, totalUsers, totalRooms, totalOrders, pendingServices] = await Promise.all([
      this.hotelRepo.count(),
      this.userRepo.count(),
      this.roomRepo.count(),
      this.orderRepo.count(),
      this.serviceRepo.count({ where: { status: 1 } }),
    ]);
    const revenueResult = await this.orderRepo
      .createQueryBuilder('o')
      .select('SUM(o.totalAmount)', 'total')
      .where('o.status IN (2,3,4)')
      .getRawOne();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await this.orderRepo.count({ where: { createdAt: Not(IsNull()) } });
    const recentOrders = await this.orderRepo.find({
      order: { createdAt: 'DESC' },
      take: 20,
      relations: ['room', 'hotel'],
    });
    return {
      totalHotels,
      totalUsers,
      totalRooms,
      totalOrders,
      pendingServices,
      totalRevenue: Number(revenueResult?.total || 0),
      todayOrders,
      recentOrders,
    };
  }

  async getHotels() {
    return this.hotelRepo.find({ order: { id: 'DESC' } });
  }

  async createHotel(data: Partial<Hotel>) {
    const hotel = this.hotelRepo.create({ ...data, status: 1 });
    return this.hotelRepo.save(hotel);
  }

  async initHotel(id: number, floors: number, roomsPerFloor: number): Promise<{ rooms: number; serviceTypes: number }> {
    const hotel = await this.hotelRepo.findOne({ where: { id } });
    if (!hotel) throw new Error('酒店不存在');

    const defaultServiceTypes = [
      { name: '客房清洁', icon: 'clean' },
      { name: '送餐服务', icon: 'food' },
      { name: '维修报修', icon: 'repair' },
      { name: '叫醒服务', icon: 'alarm' },
      { name: '行李寄存', icon: 'luggage' },
      { name: '洗衣服务', icon: 'laundry' },
    ];
    const roomTypes = [1, 2, 3]; // 标准间/大床房/套房，按楼层循环

    return this.dataSource.transaction(async (manager) => {
      // 只创建该酒店尚未存在的服务类型
      const existingTypes = await manager.find(ServiceType, { where: { hotelId: id } });
      const existingNames = new Set(existingTypes.map((t) => t.name));
      const typesToCreate = defaultServiceTypes
        .filter((t) => !existingNames.has(t.name))
        .map((t) => manager.create(ServiceType, { hotelId: id, name: t.name, icon: t.icon, status: 1 }));
      if (typesToCreate.length) await manager.save(ServiceType, typesToCreate);

      // 只创建尚未存在的房间
      const existingRooms = await manager.find(Room, { where: { hotelId: id } });
      const existingNumbers = new Set(existingRooms.map((r) => r.roomNumber));
      const roomsToCreate: Room[] = [];
      for (let floor = 1; floor <= floors; floor++) {
        for (let num = 1; num <= roomsPerFloor; num++) {
          const roomNumber = `${floor}${String(num).padStart(2, '0')}`;
          if (!existingNumbers.has(roomNumber)) {
            roomsToCreate.push(
              manager.create(Room, {
                hotelId: id,
                floor,
                roomNumber,
                type: roomTypes[(num - 1) % 3],
                status: 1,
                price: 299 + ((num - 1) % 3) * 100,
              }),
            );
          }
        }
      }
      if (roomsToCreate.length) await manager.save(Room, roomsToCreate);

      return { rooms: roomsToCreate.length, serviceTypes: typesToCreate.length };
    });
  }

  async updateHotel(id: number, data: Partial<Hotel>) {
    await this.hotelRepo.update(id, data);
    return this.hotelRepo.findOne({ where: { id } });
  }

  async generateHotelQrCode(id: number, baseUrl: string): Promise<{ dataUrl: string; loginUrl: string }> {
    const hotel = await this.hotelRepo.findOne({ where: { id } });
    if (!hotel) throw new Error('酒店不存在');
    const loginUrl = `${baseUrl}/login?hotelId=${id}`;
    const dataUrl = await QRCode.toDataURL(loginUrl, { width: 300, margin: 2 });
    return { dataUrl, loginUrl };
  }

  async getUsers(page = 1, limit = 20, hotelId?: number, role?: number) {
    const where: any = {};
    if (hotelId) where.hotelId = hotelId;
    if (role) where.role = role;
    const [users, total] = await this.userRepo.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['hotel'],
    });
    return { users, total };
  }

  async updateUser(id: number, data: { role?: number; status?: number; name?: string; phone?: string }) {
    await this.userRepo.update(id, data);
    return this.userRepo.findOne({ where: { id } });
  }

  async approveHotelAdmin(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId, role: 2 } });
    if (!user) throw new Error('酒店管理员不存在');
    await this.userRepo.update(userId, { status: 1 });
    if (user.hotelId) {
      await this.hotelRepo.update(user.hotelId, { status: 1 });
    }
    return { message: '审核通过' };
  }

  async rejectHotelAdmin(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId, role: 2 } });
    if (!user) throw new Error('酒店管理员不存在');
    await this.userRepo.update(userId, { status: 0 });
    return { message: '已拒绝' };
  }

  async getPendingHotelAdmins() {
    return this.userRepo.find({
      where: { role: 2, status: 0 },
      relations: ['hotel'],
      order: { id: 'DESC' },
    });
  }

  async getOrders(page = 1, limit = 20, hotelId?: number, status?: number) {
    const where: any = {};
    if (hotelId) where.hotelId = hotelId;
    if (status) where.status = status;
    const [orders, total] = await this.orderRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['room', 'hotel'],
    });
    return { orders, total };
  }

  async updateOrderStatus(id: number, status: number) {
    await this.orderRepo.update(id, { status });
    return this.orderRepo.findOne({ where: { id } });
  }

  async getServices(hotelId?: number, status?: number) {
    const where: any = {};
    if (hotelId) where.hotelId = hotelId;
    if (status) where.status = status;
    return this.serviceRepo.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['type', 'room', 'user', 'hotel'],
    });
  }

  async updateServiceStatus(id: number, status: number) {
    await this.serviceRepo.update(id, { status });
    return this.serviceRepo.findOne({ where: { id }, relations: ['type', 'room'] });
  }

  async getRooms(hotelId?: number) {
    const where: any = hotelId ? { hotelId } : {};
    return this.roomRepo.find({
      where,
      order: { hotelId: 'ASC', floor: 'ASC', roomNumber: 'ASC' },
      relations: ['hotel'],
    });
  }

  async updateRoomStatus(id: number, status: number) {
    await this.roomRepo.update(id, { status });
    return this.roomRepo.findOne({ where: { id } });
  }

  async checkIn(data: { hotelId: number; roomNumber: string; name: string; phone: string }) {
    const room = await this.roomRepo.findOne({
      where: { hotelId: data.hotelId, roomNumber: data.roomNumber },
    });
    if (!room) throw new Error(`房间 ${data.roomNumber} 不存在`);

    const openid = `checkin_${data.hotelId}_${data.roomNumber}_${Date.now()}`;
    let user = await this.userRepo.findOne({ where: { hotelId: data.hotelId, roomId: room.id, status: 1 } });
    if (user) {
      await this.userRepo.update(user.id, { name: data.name, phone: data.phone });
      user = await this.userRepo.findOne({ where: { id: user.id } });
    } else {
      user = this.userRepo.create({
        openid,
        name: data.name,
        phone: data.phone,
        hotelId: data.hotelId,
        roomId: room.id,
        role: 1,
        status: 1,
      });
      user = await this.userRepo.save(user);
    }
    await this.roomRepo.update(room.id, { status: 2 });
    return { user, room };
  }

  async checkOut(userId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('用户不存在');
    if (user.roomId) {
      await this.roomRepo.update(user.roomId, { status: 1 });
    }
    await this.userRepo.update(userId, { roomId: null as any, status: 0 });
    return { success: true };
  }

  async getCheckins(hotelId?: number) {
    const where: any = { role: 1, status: 1 };
    if (hotelId) where.hotelId = hotelId;
    return this.userRepo.find({
      where,
      relations: ['room', 'hotel'],
      order: { id: 'DESC' },
    });
  }

  // --- Product management ---
  async getProducts(hotelId?: number, category?: string) {
    return this.productService.findAllByHotel(hotelId || 0, category);
  }

  async createProduct(data: Partial<Product>) {
    return this.productService.create(data);
  }

  async updateProduct(id: number, data: Partial<Product>) {
    return this.productService.update(id, data);
  }

  async deleteProduct(id: number) {
    return this.productService.delete(id);
  }

  // ─── Privilege management ────────────────────────────────────────────

  async getPrivilege(hotelId: number) {
    const hotel = await this.hotelRepo.findOne({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('酒店不存在');
    const subscription = await this.subscriptionRepo.findOne({
      where: { hotelId, status: 'active' },
      relations: ['plan'],
      order: { expiresAt: 'DESC' },
    });
    return {
      hotelId: hotel.id,
      hotelName: hotel.name,
      effectivePlan: hotel.effectivePlan,
      planOverride: hotel.planOverride,
      planOverrideNote: hotel.planOverrideNote,
      planOverrideBy: hotel.planOverrideBy,
      planOverrideAt: hotel.planOverrideAt,
      subscription: subscription
        ? {
            id: subscription.id,
            planName: subscription.plan?.name,
            billingCycle: subscription.billingCycle,
            status: subscription.status,
            startedAt: subscription.startedAt,
            expiresAt: subscription.expiresAt,
          }
        : null,
    };
  }

  async setPrivilege(hotelId: number, dto: SetPrivilegeDto, operatorId: number) {
    const hotel = await this.hotelRepo.findOne({ where: { id: hotelId } });
    if (!hotel) throw new NotFoundException('酒店不存在');
    hotel.effectivePlan = dto.planName;
    hotel.planOverride = true;
    hotel.planOverrideNote = dto.reason;
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
