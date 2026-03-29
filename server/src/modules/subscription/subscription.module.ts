import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Plan, Subscription, SubscriptionOrder, Hotel } from '@/entities';
import { SubscriptionService } from './subscription.service';
import {
  SysadminSubscriptionController,
  HotelAdminSubscriptionController,
} from './subscription.controller';
import { PlanGuard } from '@/common/guards/plan.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plan, Subscription, SubscriptionOrder, Hotel]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SysadminSubscriptionController, HotelAdminSubscriptionController],
  providers: [SubscriptionService, PlanGuard],
  exports: [SubscriptionService, PlanGuard],
})
export class SubscriptionModule {}
