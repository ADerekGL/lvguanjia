import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('应用')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '欢迎页面' })
  getWelcome(): string {
    return this.appService.getWelcome();
  }

  @Get('health')
  @ApiOperation({ summary: '健康检查' })
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }

  @Get('version')
  @ApiOperation({ summary: '获取版本信息' })
  getVersion(): { version: string; name: string; description: string } {
    return this.appService.getVersion();
  }
}