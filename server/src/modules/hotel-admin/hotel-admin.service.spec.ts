import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HotelAdminService } from './hotel-admin.service';
import { User, Room, Order, ServiceRequest, Product } from '@/entities';

const mockRepo = () => ({
  count: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('HotelAdminService — data isolation', () => {
  let service: HotelAdminService;
  let userRepo: ReturnType<typeof mockRepo>;
  let roomRepo: ReturnType<typeof mockRepo>;
  let orderRepo: ReturnType<typeof mockRepo>;
  let serviceRepo: ReturnType<typeof mockRepo>;
  let productRepo: ReturnType<typeof mockRepo>;

  const HOTEL_A = 1;
  const HOTEL_B = 2;

  beforeEach(async () => {
    userRepo = mockRepo();
    roomRepo = mockRepo();
    orderRepo = mockRepo();
    serviceRepo = mockRepo();
    productRepo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelAdminService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Room), useValue: roomRepo },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(ServiceRequest), useValue: serviceRepo },
        { provide: getRepositoryToken(Product), useValue: productRepo },
      ],
    }).compile();

    service = module.get<HotelAdminService>(HotelAdminService);
  });

  describe('getStats', () => {
    it('queries only within the given hotelId', async () => {
      roomRepo.count.mockResolvedValue(5);
      userRepo.count.mockResolvedValue(3);
      orderRepo.count.mockResolvedValue(10);
      serviceRepo.count.mockResolvedValue(2);
      const qb = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '500' }),
      };
      orderRepo.createQueryBuilder.mockReturnValue(qb);

      await service.getStats(HOTEL_A);

      expect(roomRepo.count).toHaveBeenCalledWith({ where: { hotelId: HOTEL_A } });
      expect(userRepo.count).toHaveBeenCalledWith({ where: { hotelId: HOTEL_A, role: 1 } });
      expect(orderRepo.count).toHaveBeenCalledWith({ where: { hotelId: HOTEL_A } });
      expect(serviceRepo.count).toHaveBeenCalledWith({ where: { hotelId: HOTEL_A, status: 1 } });
    });
  });

  describe('getRooms', () => {
    it('filters by hotelId — hotel B cannot see hotel A rooms', async () => {
      const hotelARooms = [{ id: 1, hotelId: HOTEL_A, roomNumber: '101' }];
      roomRepo.find.mockResolvedValue(hotelARooms);

      await service.getRooms(HOTEL_B);

      expect(roomRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { hotelId: HOTEL_B } }),
      );
    });
  });

  describe('updateRoomStatus', () => {
    it('includes hotelId in WHERE clause — cannot update another hotel room', async () => {
      roomRepo.update.mockResolvedValue({ affected: 0 });

      await service.updateRoomStatus(99, 2, HOTEL_A);

      expect(roomRepo.update).toHaveBeenCalledWith({ id: 99, hotelId: HOTEL_A }, { status: 2 });
    });
  });

  describe('getUsers', () => {
    it('filters guests by hotelId', async () => {
      userRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getUsers(HOTEL_A);

      expect(userRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { hotelId: HOTEL_A, role: 1 } }),
      );
    });
  });

  describe('updateUser', () => {
    it('includes hotelId in WHERE clause — cannot update user from another hotel', async () => {
      userRepo.update.mockResolvedValue({ affected: 1 });
      userRepo.findOne.mockResolvedValue({ id: 5, hotelId: HOTEL_A, name: '张三' });

      await service.updateUser(5, HOTEL_A, { name: '李四' });

      expect(userRepo.update).toHaveBeenCalledWith({ id: 5, hotelId: HOTEL_A }, { name: '李四' });
    });
  });

  describe('getOrders', () => {
    it('filters orders by hotelId', async () => {
      orderRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getOrders(HOTEL_B);

      expect(orderRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { hotelId: HOTEL_B } }),
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('includes hotelId in WHERE — hotel B cannot change hotel A order', async () => {
      orderRepo.update.mockResolvedValue({ affected: 0 });

      await service.updateOrderStatus(42, 4, HOTEL_B);

      expect(orderRepo.update).toHaveBeenCalledWith({ id: 42, hotelId: HOTEL_B }, { status: 4 });
    });
  });

  describe('getServices', () => {
    it('filters service requests by hotelId', async () => {
      serviceRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getServices(HOTEL_A);

      expect(serviceRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { hotelId: HOTEL_A } }),
      );
    });
  });

  describe('getProducts', () => {
    it('filters products by hotelId', async () => {
      productRepo.find.mockResolvedValue([]);

      await service.getProducts(HOTEL_A);

      expect(productRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { hotelId: HOTEL_A } }),
      );
    });
  });

  describe('createProduct', () => {
    it('forces hotelId onto new product — cannot create for another hotel', async () => {
      const data = { name: '矿泉水', price: 5 };
      const created = { ...data, hotelId: HOTEL_A };
      productRepo.create.mockReturnValue(created);
      productRepo.save.mockResolvedValue({ id: 1, ...created });

      await service.createProduct(HOTEL_A, data);

      expect(productRepo.create).toHaveBeenCalledWith({ ...data, hotelId: HOTEL_A });
    });
  });

  describe('updateProduct', () => {
    it('includes hotelId in WHERE — cannot update product from another hotel', async () => {
      productRepo.update.mockResolvedValue({ affected: 1 });
      productRepo.findOne.mockResolvedValue({ id: 7, hotelId: HOTEL_A });

      await service.updateProduct(7, HOTEL_A, { price: 8 });

      expect(productRepo.update).toHaveBeenCalledWith({ id: 7, hotelId: HOTEL_A }, { price: 8 });
    });
  });

  describe('deleteProduct', () => {
    it('includes hotelId in WHERE — cannot delete product from another hotel', async () => {
      productRepo.delete.mockResolvedValue({ affected: 1 });

      await service.deleteProduct(7, HOTEL_A);

      expect(productRepo.delete).toHaveBeenCalledWith({ id: 7, hotelId: HOTEL_A });
    });
  });

  describe('createCheckin', () => {
    it('verifies room belongs to hotel before creating guest', async () => {
      roomRepo.findOne.mockResolvedValue(null);

      await expect(service.createCheckin(HOTEL_A, { name: '王五', phone: '13800138000', roomId: 99 }))
        .rejects.toThrow('房间不存在');

      expect(roomRepo.findOne).toHaveBeenCalledWith({ where: { id: 99, hotelId: HOTEL_A } });
    });

    it('rejects checkin if room already occupied', async () => {
      roomRepo.findOne.mockResolvedValue({ id: 1, hotelId: HOTEL_A, status: 1 });
      userRepo.findOne.mockResolvedValue({ id: 10, roomId: 1 });

      await expect(service.createCheckin(HOTEL_A, { name: '王五', phone: '13800138000', roomId: 1 }))
        .rejects.toThrow('该房间已有入住客人');
    });

    it('creates guest scoped to hotel and marks room occupied', async () => {
      const room = { id: 1, hotelId: HOTEL_A, status: 1 };
      roomRepo.findOne.mockResolvedValue(room);
      userRepo.findOne.mockResolvedValue(null);
      const guest = { id: 20, name: '王五', hotelId: HOTEL_A, roomId: 1 };
      userRepo.create.mockReturnValue(guest);
      userRepo.save.mockResolvedValue(guest);
      roomRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.createCheckin(HOTEL_A, { name: '王五', phone: '13800138000', roomId: 1 });

      expect(userRepo.create).toHaveBeenCalledWith(expect.objectContaining({ hotelId: HOTEL_A, roomId: 1, role: 1 }));
      expect(roomRepo.update).toHaveBeenCalledWith({ id: 1 }, { status: 2 });
      expect(result).toEqual(guest);
    });
  });

  describe('deleteCheckin', () => {
    it('rejects checkout for user not belonging to hotel', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.deleteCheckin(99, HOTEL_A)).rejects.toThrow('用户不存在');

      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 99, hotelId: HOTEL_A, role: 1 } });
    });

    it('disables guest and frees room on checkout', async () => {
      const guest = { id: 20, hotelId: HOTEL_A, roomId: 1, role: 1 };
      userRepo.findOne.mockResolvedValue(guest);
      userRepo.update.mockResolvedValue({ affected: 1 });
      roomRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.deleteCheckin(20, HOTEL_A);

      expect(userRepo.update).toHaveBeenCalledWith(20, { status: 0, roomId: null });
      expect(roomRepo.update).toHaveBeenCalledWith({ id: 1 }, { status: 1 });
      expect(result).toEqual({ success: true });
    });
  });
});
