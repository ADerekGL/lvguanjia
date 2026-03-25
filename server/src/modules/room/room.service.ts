import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '@/entities';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  async findById(id: number): Promise<Room | null> {
    return this.roomRepository.findOne({ where: { id } });
  }

  async findByHotelId(hotelId: number): Promise<Room[]> {
    return this.roomRepository.find({
      where: { hotelId },
      order: { floor: 'ASC', roomNumber: 'ASC' },
    });
  }

  async findAvailable(hotelId: number): Promise<Room[]> {
    return this.roomRepository.find({
      where: { hotelId, status: 1 },
      order: { floor: 'ASC', roomNumber: 'ASC' },
    });
  }

  async create(data: Partial<Room>): Promise<Room> {
    const room = this.roomRepository.create(data);
    return this.roomRepository.save(room);
  }

  async update(id: number, data: Partial<Room>): Promise<Room> {
    await this.roomRepository.update(id, data);
    const room = await this.findById(id);
    if (!room) throw new NotFoundException('房间不存在');
    return room;
  }

  async updateStatus(id: number, status: number): Promise<Room> {
    return this.update(id, { status });
  }
}
