import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel, User, Room, Order, ServiceRequest } from '@/entities';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel, User, Room, Order, ServiceRequest])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
