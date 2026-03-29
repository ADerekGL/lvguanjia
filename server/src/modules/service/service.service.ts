import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest, ServiceType } from '@/entities';
import { SocketGateway } from '../socket/socket.gateway';

const STATUS_LABELS: Record<number, string> = {
  1: '待处理',
  2: '处理中',
  3: '已完成',
  4: '已取消',
};

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(ServiceRequest)
    private serviceRequestRepository: Repository<ServiceRequest>,
    @InjectRepository(ServiceType)
    private serviceTypeRepository: Repository<ServiceType>,
    private socketGateway: SocketGateway,
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
    const updated = await this.findById(id) as ServiceRequest;
    // Push real-time notification to guest
    if (updated?.userId) {
      this.socketGateway.sendNotification(updated.userId, 'service_update', {
        id: updated.id,
        status,
        statusLabel: STATUS_LABELS[status] || String(status),
        typeId: updated.typeId,
      });
    }
    return updated;
  }
}
