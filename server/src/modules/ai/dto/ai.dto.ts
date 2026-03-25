import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

export class AskQuestionDto {
  @ApiProperty({
    description: '问题内容',
    example: '酒店早餐时间是什么时候？',
    required: true,
  })
  @IsString({ message: '问题必须是字符串' })
  @IsNotEmpty({ message: '问题不能为空' })
  @MinLength(2, { message: '问题至少2个字符' })
  @MaxLength(500, { message: '问题最多500个字符' })
  question: string;
}

export class GetRecommendationsDto {
  @ApiProperty({
    description: '推荐上下文（可选）',
    example: '商务出差，需要会议室',
    required: false,
  })
  @IsString({ message: '上下文必须是字符串' })
  @IsOptional()
  @MaxLength(200, { message: '上下文最多200个字符' })
  context?: string;
}

export class AiUsageResponseDto {
  @ApiProperty({ description: '今日使用次数', example: 12 })
  today: number;

  @ApiProperty({ description: '总使用次数', example: 45 })
  total: number;

  @ApiProperty({ description: '每日限制次数', example: 50 })
  limit: number;
}

export class AiAnswerResponseDto {
  @ApiProperty({
    description: 'AI回答内容',
    example: '酒店早餐时间为6:30-10:00，在一楼餐厅提供中西式自助早餐。',
  })
  answer: string;

  @ApiProperty({
    description: '使用统计',
    example: { tokens: 85, cost: 0.01 },
  })
  usage: {
    tokens: number;
    cost: number;
  };

  @ApiProperty({ description: '是否来自缓存', example: false })
  cached: boolean;
}

export class RecommendationItemDto {
  @ApiProperty({ description: '项目ID', example: 1 })
  id: number;

  @ApiProperty({ description: '项目名称', example: '豪华早餐套餐' })
  name: string;

  @ApiProperty({ description: '项目描述', example: '中西式自助早餐' })
  description: string;

  @ApiProperty({
    description: '推荐理由',
    example: '根据早餐时段和您的入住习惯推荐',
  })
  reason: string;
}

export class RecommendationsResponseDto {
  @ApiProperty({
    description: '推荐商品列表',
    type: [RecommendationItemDto],
  })
  products: RecommendationItemDto[];

  @ApiProperty({
    description: '推荐服务列表',
    type: [RecommendationItemDto],
  })
  services: RecommendationItemDto[];
}

export class FaqCategoryDto {
  @ApiProperty({ description: '分类名称', example: '入住相关' })
  name: string;

  @ApiProperty({
    description: '问题列表',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        question: { type: 'string', example: '入住时间是什么时候？' },
        answer: { type: 'string', example: '入住时间为下午14:00后，退房时间为中午12:00前。' },
      },
    },
  })
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export class FaqResponseDto {
  @ApiProperty({
    description: '常见问题分类',
    type: [FaqCategoryDto],
  })
  categories: FaqCategoryDto[];
}