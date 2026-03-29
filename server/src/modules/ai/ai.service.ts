import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly modelId: string;
  private readonly enabled: boolean;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('ai.apiKey') || '';
    this.modelId = this.configService.get<string>('ai.modelId') || 'doubao-pro-4k';
    this.enabled = this.configService.get<boolean>('features.aiEnabled') || false;
  }

  /**
   * 智能问答
   */
  async askQuestion(
    roomId: number,
    userId: number,
    question: string,
  ): Promise<{
    answer: string;
    usage: { tokens: number; cost: number };
    cached: boolean;
  }> {
    // 检查当日调用次数限制（每房间每日50次免费）
    const dailyKey = `ai:daily:${roomId}:${this.getTodayDate()}`;
    const dailyCount = await this.redis.get(dailyKey);
    const maxDailyCalls = 50;

    if (parseInt(dailyCount || '0') >= maxDailyCalls) {
      throw new HttpException(
        '今日AI问答次数已用完，请升级服务或等待次日重置',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 检查缓存
    const cacheKey = `ai:cache:${crypto
      .createHash('md5')
      .update(question)
      .digest('hex')}`;
    const cachedAnswer = await this.redis.get(cacheKey);

    if (cachedAnswer) {
      // 缓存命中，不计数
      return {
        answer: cachedAnswer,
        usage: { tokens: 0, cost: 0 },
        cached: true,
      };
    }

    try {
      // 调用火山引擎豆包API
      const response = await this.callDoubaoApi(question);

      // 更新计数器
      await this.redis.incr(dailyKey);
      await this.redis.expire(dailyKey, 24 * 60 * 60); // 24小时过期

      // 缓存答案（24小时）
      await this.redis.set(cacheKey, response.answer, 'EX', 24 * 60 * 60);

      return {
        answer: response.answer,
        usage: response.usage,
        cached: false,
      };
    } catch (error) {
      console.error('AI问答调用失败:', error);

      // 降级：使用规则引擎回答简单问题
      const fallbackAnswer = this.getFallbackAnswer(question);
      return {
        answer: fallbackAnswer,
        usage: { tokens: 0, cost: 0 },
        cached: false,
      };
    }
  }

  /**
   * 智能推荐
   */
  async getRecommendations(
    roomId: number,
    userId: number,
    context?: string,
  ): Promise<{
    products: Array<{
      id: number;
      name: string;
      description: string;
      reason: string;
    }>;
    services: Array<{
      id: number;
      name: string;
      description: string;
      reason: string;
    }>;
  }> {
    // 基于用户历史行为、房间类型、时间等生成推荐
    // 这里简化实现，实际应调用AI推荐算法

    const hour = new Date().getHours();
    let timeBased = '';

    if (hour >= 6 && hour < 10) {
      timeBased = '早餐时段';
    } else if (hour >= 11 && hour < 14) {
      timeBased = '午餐时段';
    } else if (hour >= 17 && hour < 21) {
      timeBased = '晚餐时段';
    } else if (hour >= 22 || hour < 6) {
      timeBased = '夜间时段';
    } else {
      timeBased = '日间时段';
    }

    // 模拟推荐结果
    const recommendations = {
      products: [
        {
          id: 1,
          name: '豪华早餐套餐',
          description: '中西式自助早餐',
          reason: `根据${timeBased}和您的入住习惯推荐`,
        },
        {
          id: 3,
          name: '红酒一瓶',
          description: '法国进口干红葡萄酒',
          reason: '适合放松心情，提升住宿体验',
        },
      ],
      services: [
        {
          id: 2,
          name: 'SPA按摩服务',
          description: '60分钟全身放松按摩',
          reason: '检测到您最近有疲劳迹象，推荐放松服务',
        },
        {
          id: 4,
          name: '客房清洁服务',
          description: '专业深度清洁',
          reason: '根据您的清洁周期推荐',
        },
      ],
    };

    // 如果有上下文，可以进一步个性化
    if (context?.includes('商务')) {
      recommendations.products.push({
        id: 6,
        name: '会议室使用',
        description: '2小时小型会议室',
        reason: '根据您的商务需求推荐',
      });
    }

    return recommendations;
  }

  /**
   * 获取房间AI使用统计
   */
  async getRoomUsage(roomId: number): Promise<{
    today: number;
    total: number;
    limit: number;
  }> {
    const dailyKey = `ai:daily:${roomId}:${this.getTodayDate()}`;
    const totalKey = `ai:total:${roomId}`;

    const [todayCount, totalCount] = await Promise.all([
      this.redis.get(dailyKey) || '0',
      this.redis.get(totalKey) || '0',
    ]);

    return {
      today: parseInt(todayCount as string),
      total: parseInt(totalCount as string),
      limit: 50,
    };
  }

  /**
   * 调用火山引擎 Ark API（OpenAI 兼容格式）
   */
  private async callDoubaoApi(question: string): Promise<{
    answer: string;
    usage: { tokens: number; cost: number };
  }> {
    if (!this.enabled || !this.apiKey) {
      const answer = this.getFallbackAnswer(question);
      return { answer, usage: { tokens: 0, cost: 0 } };
    }

    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      {
        model: this.modelId,
        messages: [
          {
            role: 'system',
            content: '你是一名专业的酒店管家助手，请用简洁、友好的中文回答客人的问题。',
          },
          { role: 'user', content: question },
        ],
        max_tokens: 800,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      },
    );

    const content: string = response.data?.choices?.[0]?.message?.content || '';
    const totalTokens: number = response.data?.usage?.total_tokens || 0;

    return {
      answer: content,
      usage: {
        tokens: totalTokens,
        cost: parseFloat((totalTokens * 0.000015).toFixed(6)),
      },
    };
  }

  /**
   * 规则引擎降级回答
   */
  private getFallbackAnswer(question: string): string {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('早餐') || lowerQuestion.includes('吃饭')) {
      return '酒店早餐时间为6:30-10:00，在一楼餐厅提供中西式自助早餐。您也可以通过小程序点餐送到房间。';
    } else if (lowerQuestion.includes('wifi') || lowerQuestion.includes('网络')) {
      return '酒店WiFi名称：SmartHotel-Guest，密码：hotel2024。如需高速网络，请联系前台升级。';
    } else if (lowerQuestion.includes('退房') || lowerQuestion.includes('checkout')) {
      return '退房时间为中午12:00前。如需延迟退房，请提前联系前台，视房态可延长至14:00。';
    } else if (lowerQuestion.includes('洗衣') || lowerQuestion.includes('laundry')) {
      return '洗衣服务请联系客房服务，或通过小程序下单。普通衣物4小时可取，加急服务2小时。';
    } else if (lowerQuestion.includes('spa') || lowerQuestion.includes('按摩')) {
      return 'SPA中心营业时间：10:00-22:00。推荐60分钟全身按摩，可通过小程序预约。';
    } else if (lowerQuestion.includes('叫醒') || lowerQuestion.includes('wakeup')) {
      return '请告知需要叫醒的时间，我们将准时为您提供叫醒服务。';
    } else {
      return '感谢您的咨询！我已经记录您的问题，稍后会有专属管家为您详细解答。同时，您可以通过小程序查看常见问题或联系在线客服。';
    }
  }

  /**
   * 获取今日日期字符串
   */
  private getTodayDate(): string {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  }
}