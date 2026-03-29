import { Controller, Get, Query, ParseIntPipe, UseGuards, Request, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('消息')
@Controller('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('room')
  @ApiOperation({ summary: '获取当前房间消息历史（按时间升序）' })
  @ApiQuery({ name: 'limit', required: false, description: '返回条数，默认50', example: 50 })
  @ApiQuery({ name: 'offset', required: false, description: '偏移量，用于分页', example: 0 })
  @ApiResponse({ status: 200, description: '消息列表' })
  @ApiResponse({ status: 401, description: '未认证' })
  async getRoomHistory(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    const roomId = req.user.roomId;
    return this.messageService.getRoomHistory(roomId, limit, offset);
  }

  @Get('unread')
  @ApiOperation({ summary: '获取当前用户未读消息数' })
  @ApiResponse({ status: 200, description: '返回 { count: number }' })
  @ApiResponse({ status: 401, description: '未认证' })
  async getUnreadCount(@Request() req: any) {
    const { roomId, id: userId } = req.user;
    return { count: await this.messageService.countUnread(roomId, userId) };
  }
}
