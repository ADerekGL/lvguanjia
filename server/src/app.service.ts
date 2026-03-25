import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getWelcome(): string {
    return '欢迎使用智慧酒店管家服务平台 API';
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getVersion(): { version: string; name: string; description: string } {
    return {
      version: '1.0.0',
      name: 'Smart Hotel Platform API',
      description: '智慧酒店管家服务平台后端API',
    };
  }
}