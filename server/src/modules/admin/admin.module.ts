import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel, User, Room, Order, ServiceRequest, Product, ServiceType, Subscription } from '@/entities';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hotel, User, Room, Order, ServiceRequest, Product, ServiceType, Subscription]),
    ProductModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
