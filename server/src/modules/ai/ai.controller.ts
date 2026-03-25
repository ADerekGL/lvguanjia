import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { AskQuestionDto, GetRecommendationsDto } from './dto/ai.dto';

@ApiTags('AI智能服务')
@Controller('ai')
@ApiBearerAuth()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '智能问答' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '问答成功',
    schema: {
      example: {
        code: 200,
        message: 'success',
        data: {
          answer: '酒店早餐时间为6:30-10:00，在一楼餐厅提供中西式自助早餐。',
          usage: { tokens: 85, cost: 0.01 },
          cached: false,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: '当日调用次数超限',
  })
  async askQuestion(
    @Body() askQuestionDto: AskQuestionDto,
    @Request() req,
  ) {
    const { question } = askQuestionDto;
    const { roomId, sub: userId } = req.user;

    const result = await this.aiService.askQuestion(roomId, userId, question);

    return {
      code: 200,
      message: 'success',
      data: result,
    };
  }

  @Post('recommendations')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '智能推荐' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '推荐成功',
    schema: {
      example: {
        code: 200,
        message: 'success',
        data: {
          products: [
            {
              id: 1,
              name: '豪华早餐套餐',
              description: '中西式自助早餐',
              reason: '根据早餐时段和您的入住习惯推荐',
            },
          ],
          services: [
            {
              id: 2,
              name: 'SPA按摩服务',
              description: '60分钟全身放松按摩',
              reason: '检测到您最近有疲劳迹象，推荐放松服务',
            },
          ],
        },
      },
    },
  })
  async getRecommendations(
    @Body() getRecommendationsDto: GetRecommendationsDto,
    @Request() req,
  ) {
    const { context } = getRecommendationsDto;
    const { roomId, sub: userId } = req.user;

    const recommendations = await this.aiService.getRecommendations(
      roomId,
      userId,
      context,
    );

    return {
      code: 200,
      message: 'success',
      data: recommendations,
    };
  }

  @Get('usage/:roomId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '获取房间AI使用统计' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        message: 'success',
        data: {
          today: 12,
          total: 45,
          limit: 50,
        },
      },
    },
  })
  async getRoomUsage(@Param('roomId') roomId: string, @Request() req) {
    // 验证用户是否有权限访问该房间
    if (req.user.roomId !== parseInt(roomId) && req.user.role < 2) {
      return {
        code: 403,
        message: '无权访问该房间的使用统计',
      };
    }

    const usage = await this.aiService.getRoomUsage(parseInt(roomId));

    return {
      code: 200,
      message: 'success',
      data: usage,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'AI服务健康检查' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '服务正常',
    schema: {
      example: {
        code: 200,
        message: 'success',
        data: {
          status: 'healthy',
          service: 'AI智能服务',
          version: '1.0.0',
        },
      },
    },
  })
  async healthCheck() {
    // 简单健康检查，可以扩展为检查Redis连接、AI服务连通性等
    return {
      code: 200,
      message: 'success',
      data: {
        status: 'healthy',
        service: 'AI智能服务',
        version: '1.0.0',
      },
    };
  }

  @Get('faq')
  @ApiOperation({ summary: '获取常见问题列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取成功',
    schema: {
      example: {
        code: 200,
        message: 'success',
        data: {
          categories: [
            {
              name: '入住相关',
              questions: [
                {
                  question: '入住时间是什么时候？',
                  answer: '入住时间为下午14:00后，退房时间为中午12:00前。',
                },
              ],
            },
          ],
        },
      },
    },
  })
  async getFaq() {
    const faq = {
      categories: [
        {
          name: '入住相关',
          questions: [
            {
              question: '入住时间是什么时候？',
              answer: '入住时间为下午14:00后，退房时间为中午12:00前。',
            },
            {
              question: '可以提前入住吗？',
              answer: '视房态情况，可以申请提前入住，请联系前台。',
            },
            {
              question: '如何办理退房？',
              answer: '可通过小程序快速退房，或到前台办理。',
            },
          ],
        },
        {
          name: '餐饮服务',
          questions: [
            {
              question: '早餐时间是什么时候？',
              answer: '早餐时间为6:30-10:00，在一楼餐厅。',
            },
            {
              question: '可以送餐到房间吗？',
              answer: '可以，通过小程序点餐，30分钟内送到房间。',
            },
            {
              question: '有24小时送餐服务吗？',
              answer: '部分简餐和饮料提供24小时送餐服务。',
            },
          ],
        },
        {
          name: '设施服务',
          questions: [
            {
              question: '酒店WiFi密码是多少？',
              answer: 'WiFi名称：SmartHotel-Guest，密码：hotel2024。',
            },
            {
              question: '有健身房吗？开放时间？',
              answer: '健身房在3楼，开放时间：6:00-22:00。',
            },
            {
              question: '有游泳池吗？',
              answer: '有恒温游泳池，在4楼，开放时间：8:00-21:00。',
            },
          ],
        },
        {
          name: '其他服务',
          questions: [
            {
              question: '如何联系客房服务？',
              answer: '通过小程序联系，或拨打内线电话8888。',
            },
            {
              question: '有洗衣服务吗？价格如何？',
              answer: '有洗衣服务，普通衣物50元/件，4小时可取。',
            },
            {
              question: '可以叫醒服务吗？',
              answer: '可以，请告知需要叫醒的时间。',
            },
          ],
        },
      ],
    };

    return {
      code: 200,
      message: 'success',
      data: faq,
    };
  }
}