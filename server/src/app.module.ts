import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// 配置模块
import configuration from './config/configuration';
import { DatabaseConfig } from './config/database.config';

// 核心模块
import { UserModule } from './modules/user/user.module';
import { RoomModule } from './modules/room/room.module';
import { MessageModule } from './modules/message/message.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { ServiceModule } from './modules/service/service.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AuthModule } from './modules/auth/auth.module';
import { AiModule } from './modules/ai/ai.module';
import { SocketModule } from './modules/socket/socket.module';
import { AdminModule } from './modules/admin/admin.module';

// 通用模块
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
    }),

    // Redis 模块
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'single' as const,
        options: {
          host: configService.get('redis.host', 'localhost'),
          port: configService.get('redis.port', 6379),
          password: configService.get('redis.password') || undefined,
          db: configService.get('redis.db', 0),
        },
      }),
      inject: [ConfigService],
    }),

    // 限流模块
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // 任务调度模块
    ScheduleModule.forRoot(),

    // 事件发射器模块
    EventEmitterModule.forRoot(),

    // 通用模块
    CommonModule,

    // 业务模块
    AuthModule,
    UserModule,
    RoomModule,
    MessageModule,
    ProductModule,
    OrderModule,
    ServiceModule,
    PaymentModule,
    AiModule,
    SocketModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}