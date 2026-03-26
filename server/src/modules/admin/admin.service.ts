import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { Hotel, User, Room, Order, ServiceRequest } from '@/entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Hotel) private hotelRepo: Repository<Hotel>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(ServiceRequest) private serviceRepo: Repository<ServiceRequest>,
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

  async updateHotel(id: number, data: Partial<Hotel>) {
    await this.hotelRepo.update(id, data);
    return this.hotelRepo.findOne({ where: { id } });
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

  async updateUser(id: number, data: { role?: number; status?: number }) {
    await this.userRepo.update(id, data);
    return this.userRepo.findOne({ where: { id } });
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
}
