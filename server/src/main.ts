import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // 启用 CORS
  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 全局前缀
  app.setGlobalPrefix('api');

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('智慧酒店管家服务平台 API')
    .setDescription('提供酒店智能管家服务的 API 接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('用户', '用户管理相关接口')
    .addTag('房间', '房间管理相关接口')
    .addTag('消息', '实时消息相关接口')
    .addTag('商品', '商品管理相关接口')
    .addTag('订单', '订单管理相关接口')
    .addTag('服务', '客房服务相关接口')
    .addTag('支付', '支付相关接口')
    .addTag('AI', 'AI 能力相关接口')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // 健康检查路由
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const port = configService.get<number>('APP_PORT', 3000);
  const wsPort = configService.get<number>('WS_PORT', 3001);

  await app.listen(port);
  console.log(`🚀 应用已启动，监听端口: ${port}`);
  console.log(`📚 API 文档: http://localhost:${port}/api-docs`);
  console.log(`🏥 健康检查: http://localhost:${port}/health`);
}

bootstrap().catch((err) => {
  console.error('应用启动失败:', err);
  process.exit(1);
});