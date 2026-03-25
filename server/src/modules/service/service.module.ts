import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { ServiceRequest, ServiceType } from '@/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest, ServiceType])],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
