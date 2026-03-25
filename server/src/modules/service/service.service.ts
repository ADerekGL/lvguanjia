import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest, ServiceType } from '@/entities';

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestRepository: Repository<ServiceRequest>,
    @InjectRepository(ServiceType)
    private serviceTypeRepository: Repository<ServiceType>,
  ) {}

  async findByHotel(hotelId: number): Promise<ServiceRequest[]> {
    return this.serviceRequestRepository.find({
      where: { hotelId },
      order: { createdAt: 'DESC' },
      relations: ['type', 'room', 'user'],
    });
  }

  async getServiceTypes(hotelId: number): Promise<ServiceType[]> {
    return this.serviceTypeRepository.find({
      where: { hotelId, status: 1 },
      order: { sort: 'ASC' },
    });
  }

  async createRequest(hotelId: number, roomId: number, userId: number, typeId: number, description: string): Promise<ServiceRequest> {
    const req = this.serviceRequestRepository.create({ hotelId, roomId, userId, typeId, description, status: 1 });
    return this.serviceRequestRepository.save(req);
  }

  async findByRoom(roomId: number): Promise<ServiceRequest[]> {
    return this.serviceRequestRepository.find({
      where: { roomId },
      order: { createdAt: 'DESC' },
      relations: ['type'],
    });
  }

  async findById(id: number): Promise<ServiceRequest | null> {
    return this.serviceRequestRepository.findOne({ where: { id }, relations: ['type'] });
  }

  async updateStatus(id: number, status: number, handlerId?: number): Promise<ServiceRequest> {
    const data: Partial<ServiceRequest> = { status };
    if (handlerId) data.handlerId = handlerId;
    if (status === 3) data.completedAt = new Date();
    await this.serviceRequestRepository.update(id, data);
    return this.findById(id) as Promise<ServiceRequest>;
  }
}
