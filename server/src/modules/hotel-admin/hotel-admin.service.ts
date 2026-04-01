import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Room, Order, ServiceRequest, Product } from '@/entities';

@Injectable()
export class HotelAdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Room) private roomRepo: Repository<Room>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(ServiceRequest) private serviceRepo: Repository<ServiceRequest>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async getStats(hotelId: number) {
    const [totalRooms, totalUsers, totalOrders, pendingServices] = await Promise.all([
      this.roomRepo.count({ where: { hotelId } }),
      this.userRepo.count({ where: { hotelId, role: 1 } }),
      this.orderRepo.count({ where: { hotelId } }),
      this.serviceRepo.count({ where: { hotelId, status: 1 } }),
    ]);
    const revenueResult = await this.orderRepo
      .createQueryBuilder('o')
      .select('SUM(o.totalAmount)', 'total')
      .where('o.hotelId = :hotelId AND o.status IN (2,3,4)', { hotelId })
      .getRawOne();
    return {
      totalRooms,
      totalUsers,
      totalOrders,
      pendingServices,
      totalRevenue: Number(revenueResult?.total || 0),
    };
  }

  getRooms(hotelId: number) {
    return this.roomRepo.find({ where: { hotelId }, order: { floor: 'ASC', roomNumber: 'ASC' } });
  }

  updateRoomStatus(id: number, status: number, hotelId: number) {
    return this.roomRepo.update({ id, hotelId }, { status });
  }

  async getUsers(hotelId: number, page = 1, limit = 20, search?: string) {
    const query = this.userRepo.createQueryBuilder('user')
      .where('user.hotelId = :hotelId AND user.role = 1', { hotelId });

    if (search) {
      query.andWhere('(user.name LIKE :search OR user.phone LIKE :search)', { search: `%${search}%` });
    }

    return query
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
  }

  async updateUser(id: number, hotelId: number, data: Partial<User>) {
    await this.userRepo.update({ id, hotelId }, data);
    return this.userRepo.findOne({ where: { id } });
  }

  getOrders(hotelId: number, page = 1, limit = 20) {
    return this.orderRepo.findAndCount({
      where: { hotelId },
      order: { createdAt: 'DESC' },
      relations: ['room', 'user', 'items'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  updateOrderStatus(id: number, status: number, hotelId: number) {
    return this.orderRepo.update({ id, hotelId }, { status });
  }

  getServices(hotelId: number, page = 1, limit = 20) {
    return this.serviceRepo.findAndCount({
      where: { hotelId },
      order: { createdAt: 'DESC' },
      relations: ['user', 'type', 'handler'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  updateServiceStatus(id: number, status: number, hotelId: number) {
    return this.serviceRepo.update({ id, hotelId }, { status });
  }

  getProducts(hotelId: number) {
    return this.productRepo.find({ where: { hotelId }, order: { id: 'DESC' } });
  }

  async createProduct(hotelId: number, data: Partial<Product>) {
    const product = this.productRepo.create({ ...data, hotelId });
    return this.productRepo.save(product);
  }

  async updateProduct(id: number, hotelId: number, data: Partial<Product>) {
    await this.productRepo.update({ id, hotelId }, data);
    return this.productRepo.findOne({ where: { id } });
  }

  deleteProduct(id: number, hotelId: number) {
    return this.productRepo.delete({ id, hotelId });
  }

  getCheckins(hotelId: number) {
    return this.userRepo.find({
      where: { hotelId, role: 1, status: 1 },
      relations: ['room'],
      order: { id: 'DESC' },
    });
  }

  async createCheckin(hotelId: number, data: { name: string; phone: string; roomId: number }) {
    const room = await this.roomRepo.findOne({ where: { id: data.roomId, hotelId } });
    if (!room) throw new Error('房间不存在');
    const existing = await this.userRepo.findOne({ where: { roomId: data.roomId, hotelId, status: 1, role: 1 } });
    if (existing) throw new Error('该房间已有入住客人');
    const user = this.userRepo.create({
      openid: `checkin_${data.phone}_${Date.now()}`,
      name: data.name,
      phone: data.phone,
      roomId: data.roomId,
      hotelId,
      role: 1,
      status: 1,
    });
    await this.userRepo.save(user);
    await this.roomRepo.update({ id: data.roomId }, { status: 2 });
    return user;
  }

  async deleteCheckin(userId: number, hotelId: number) {
    const user = await this.userRepo.findOne({ where: { id: userId, hotelId, role: 1 } });
    if (!user) throw new Error('用户不存在');
    await this.userRepo.update(user.id, { status: 0, roomId: null as any });
    if (user.roomId) await this.roomRepo.update({ id: user.roomId }, { status: 1 });
    return { success: true };
  }
}
