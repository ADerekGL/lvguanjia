import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const dbConfig = this.configService.get('database');

    return {
      type: 'mysql',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: dbConfig.sync,
      logging: dbConfig.logging,
      timezone: '+08:00',
      charset: 'utf8mb4',
      extra: {
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
      },
      retryAttempts: 3,
      retryDelay: 3000,
    };
  }
}