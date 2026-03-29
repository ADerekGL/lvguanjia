import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, Room, Order, ServiceRequest, Product } from '@/entities';
import { HotelAdminService } from './hotel-admin.service';
import { HotelAdminController } from './hotel-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Room, Order, ServiceRequest, Product]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [HotelAdminController],
  providers: [HotelAdminService],
})
export class HotelAdminModule {}
