import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Hotel, User, Room, Order, ServiceRequest, Product, ServiceType } from '@/entities';
import { ProductService } from '../product/product.service';
import { DataSource } from 'typeorm';

const mockRepo = () => ({
  count: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
  findAndCount: jest.fn(),
});

const mockProductService = {
  findAllByHotel: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('AdminService', () => {
  let service: AdminService;
  let hotelRepo: ReturnType<typeof mockRepo>;
  let userRepo: ReturnType<typeof mockRepo>;
  let roomRepo: ReturnType<typeof mockRepo>;
  let orderRepo: ReturnType<typeof mockRepo>;
  let serviceRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    hotelRepo = mockRepo();
    userRepo = mockRepo();
    roomRepo = mockRepo();
    orderRepo = mockRepo();
    serviceRepo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Hotel), useValue: hotelRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Room), useValue: roomRepo },
        { provide: getRepositoryToken(Order), useValue: orderRepo },
        { provide: getRepositoryToken(ServiceRequest), useValue: serviceRepo },
        { provide: getRepositoryToken(Product), useValue: mockRepo() },
        { provide: getRepositoryToken(ServiceType), useValue: mockRepo() },
        { provide: ProductService, useValue: mockProductService },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  describe('getStats', () => {
    it('returns aggregated stats', async () => {
      hotelRepo.count.mockResolvedValue(3);
      userRepo.count.mockResolvedValue(42);
      roomRepo.count.mockResolvedValue(15);
      orderRepo.count.mockResolvedValue(100);
      serviceRepo.count.mockResolvedValue(5);
      orderRepo.find.mockResolvedValue([]);
      orderRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '9999.50' }),
      });

      const stats = await service.getStats();
      expect(stats.totalHotels).toBe(3);
      expect(stats.totalUsers).toBe(42);
      expect(stats.totalRooms).toBe(15);
      expect(stats.totalOrders).toBe(100);
      expect(stats.pendingServices).toBe(5);
      expect(stats.totalRevenue).toBe(9999.5);
    });
  });

  describe('createHotel', () => {
    it('creates a hotel with status 1', async () => {
      const data = { name: '测试酒店', city: '上海' };
      const created = { ...data, status: 1, id: 1 };
      hotelRepo.create.mockReturnValue(created);
      hotelRepo.save.mockResolvedValue(created);

      const result = await service.createHotel(data);
      expect(hotelRepo.create).toHaveBeenCalledWith({ ...data, status: 1 });
      expect(result.status).toBe(1);
    });
  });

  describe('getProducts', () => {
    it('delegates to ProductService.findAllByHotel', async () => {
      const products = [{ id: 1, name: '矿泉水' }];
      mockProductService.findAllByHotel.mockResolvedValue(products);

      const result = await service.getProducts(1);
      expect(mockProductService.findAllByHotel).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual(products);
    });
  });
});
