import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, Hotel, Room } from '@/entities';
import { UserService } from '../user/user.service';

const mockRepo = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  count: jest.fn(),
});

const mockJwt = { sign: jest.fn().mockReturnValue('test_token') };
const mockConfig = { get: jest.fn() };
const mockUserService = { findById: jest.fn() };

describe('AuthService.verifyCheckin', () => {
  let service: AuthService;
  let hotelRepo: ReturnType<typeof mockRepo>;
  let roomRepo: ReturnType<typeof mockRepo>;
  let userRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    hotelRepo = mockRepo();
    roomRepo = mockRepo();
    userRepo = mockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Hotel), useValue: hotelRepo },
        { provide: getRepositoryToken(Room), useValue: roomRepo },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('throws UnauthorizedException when hotel not found', async () => {
    hotelRepo.findOne.mockResolvedValue(null);
    await expect(service.verifyCheckin('101', '1234')).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when room not found', async () => {
    hotelRepo.findOne.mockResolvedValue({ id: 1, status: 1 });
    roomRepo.findOne.mockResolvedValue(null);
    await expect(service.verifyCheckin('101', '1234')).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when no checked-in user', async () => {
    hotelRepo.findOne.mockResolvedValue({ id: 1, status: 1 });
    roomRepo.findOne.mockResolvedValue({ id: 10, hotelId: 1, roomNumber: '101' });
    userRepo.findOne.mockResolvedValue(null);
    await expect(service.verifyCheckin('101', '1234')).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when phone last4 does not match', async () => {
    hotelRepo.findOne.mockResolvedValue({ id: 1, status: 1 });
    roomRepo.findOne.mockResolvedValue({ id: 10, hotelId: 1, roomNumber: '101' });
    userRepo.findOne.mockResolvedValue({ id: 5, phone: '13800001111', status: 1, role: 1, roomId: 10, hotelId: 1 });
    await expect(service.verifyCheckin('101', '9999')).rejects.toThrow(UnauthorizedException);
  });

  it('returns token + user on successful verification', async () => {
    const fakeUser = { id: 5, name: '张三', phone: '13800001234', avatar: null, status: 1, role: 1, roomId: 10, hotelId: 1 };
    hotelRepo.findOne.mockResolvedValue({ id: 1, status: 1 });
    roomRepo.findOne.mockResolvedValue({ id: 10, hotelId: 1, roomNumber: '101' });
    userRepo.findOne.mockResolvedValue(fakeUser);
    userRepo.update.mockResolvedValue({});

    const result = await service.verifyCheckin('101', '1234');
    expect(result.token).toBe('test_token');
    expect(result.user.id).toBe(5);
    expect(mockJwt.sign).toHaveBeenCalled();
  });

  it('uses specific hotelId when provided', async () => {
    const fakeUser = { id: 7, name: '李四', phone: '13900005678', avatar: null, status: 1, role: 1, roomId: 20, hotelId: 2 };
    hotelRepo.findOne.mockResolvedValue({ id: 2, status: 1 });
    roomRepo.findOne.mockResolvedValue({ id: 20, hotelId: 2, roomNumber: '201' });
    userRepo.findOne.mockResolvedValue(fakeUser);
    userRepo.update.mockResolvedValue({});

    const result = await service.verifyCheckin('201', '5678', 2);
    expect(hotelRepo.findOne).toHaveBeenCalledWith({ where: { id: 2, status: 1 } });
    expect(result.token).toBe('test_token');
  });
});
