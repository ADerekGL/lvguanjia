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