import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceRequest, ServiceType } from '@/entities';
import { SocketGateway } from '../socket/socket.gateway';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

const mockSocketGateway = { sendNotification: jest.fn() };

describe('ServiceService', () => {
  let service: ServiceService;
  let serviceRequestRepo: ReturnType<typeof mockRepo>;
  let serviceTypeRepo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    serviceRequestRepo = mockRepo();
    serviceTypeRepo = mockRepo();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServiceService,
        { provide: getRepositoryToken(ServiceRequest), useValue: serviceRequestRepo },
        { provide: getRepositoryToken(ServiceType), useValue: serviceTypeRepo },
        { provide: SocketGateway, useValue: mockSocketGateway },
      ],
    }).compile();

    service = module.get<ServiceService>(ServiceService);
  });

  describe('createRequest', () => {
    it('creates and returns a service request', async () => {
      const req = { id: 1, hotelId: 1, roomId: 10, userId: 5, typeId: 3, description: '需要毛巾', status: 1 };
      serviceRequestRepo.create.mockReturnValue(req);
      serviceRequestRepo.save.mockResolvedValue(req);

      const result = await service.createRequest(1, 10, 5, 3, '需要毛巾');
      expect(serviceRequestRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ hotelId: 1, roomId: 10, userId: 5, status: 1 })
      );
      expect(result.id).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('updates status and sends socket notification to user', async () => {
      const updated = { id: 1, userId: 5, status: 3, typeId: 2, completedAt: null };
      serviceRequestRepo.update.mockResolvedValue({});
      serviceRequestRepo.findOne.mockResolvedValue(updated);

      const result = await service.updateStatus(1, 3);
      expect(serviceRequestRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ status: 3 }));
      expect(mockSocketGateway.sendNotification).toHaveBeenCalledWith(
        5, 'service_update',
        expect.objectContaining({ id: 1, status: 3, statusLabel: '已完成' })
      );
      expect(result.status).toBe(3);
    });

    it('sets completedAt when status is 3', async () => {
      const updated = { id: 2, userId: 7, status: 3, typeId: 1 };
      serviceRequestRepo.update.mockResolvedValue({});
      serviceRequestRepo.findOne.mockResolvedValue(updated);

      await service.updateStatus(2, 3, 99);
      expect(serviceRequestRepo.update).toHaveBeenCalledWith(
        2, expect.objectContaining({ completedAt: expect.any(Date) })
      );
    });

    it('does not send notification when userId is missing', async () => {
      serviceRequestRepo.update.mockResolvedValue({});
      serviceRequestRepo.findOne.mockResolvedValue({ id: 3, userId: null, status: 2, typeId: 1 });

      await service.updateStatus(3, 2);
      expect(mockSocketGateway.sendNotification).not.toHaveBeenCalled();
    });
  });

  describe('findByRoom', () => {
    it('returns service requests for a room ordered by createdAt DESC', async () => {
      const requests = [{ id: 5 }, { id: 3 }];
      serviceRequestRepo.find.mockResolvedValue(requests);

      const result = await service.findByRoom(10);
      expect(serviceRequestRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { roomId: 10 } })
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('getServiceTypes', () => {
    it('returns active service types for a hotel', async () => {
      const types = [{ id: 1, name: '客房清洁', status: 1 }];
      serviceTypeRepo.find.mockResolvedValue(types);

      const result = await service.getServiceTypes(1);
      expect(serviceTypeRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { hotelId: 1, status: 1 } })
      );
      expect(result).toEqual(types);
    });
  });
});
