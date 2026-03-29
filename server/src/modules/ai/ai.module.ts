import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { SubscriptionModule } from '../subscription/subscription.module';
import { Hotel } from '@/entities';

@Module({
  imports: [ConfigModule, SubscriptionModule, TypeOrmModule.forFeature([Hotel])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
