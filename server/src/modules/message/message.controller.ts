import { Controller, Get, Query, ParseIntPipe, UseGuards, Request, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('消息')
@Controller('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get('room')
  @ApiOperation({ summary: '获取房间消息历史' })
  async getRoomHistory(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    const roomId = req.user.roomId;
    return this.messageService.getRoomHistory(roomId, limit, offset);
  }

  @Get('unread')
  @ApiOperation({ summary: '获取未读消息数' })
  async getUnreadCount(@Request() req: any) {
    const { roomId, id: userId } = req.user;
    return { count: await this.messageService.countUnread(roomId, userId) };
  }
}
