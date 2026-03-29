import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';

import { SocketService } from './socket.service';
import { WsJwtGuard } from '@/common/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'chat',
})
@Injectable()
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private socketService: SocketService) {}

  /**
   * 客户端连接
   */
  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization;
      const user = await this.socketService.validateToken(token);

      if (user) {
        // 将用户信息附加到socket对象
        client.data.user = user;

        // 加入房间（基于用户的roomId）
        if (user.roomId) {
          client.join(`room:${user.roomId}`);
          console.log(`用户 ${user.id} 加入房间 ${user.roomId}`);
        }

        // 加入用户个人房间
        client.join(`user:${user.id}`);

        // 发送连接成功消息
        client.emit('connected', { message: '连接成功', user });
      } else {
        client.disconnect();
      }
    } catch (error) {
      client.disconnect();
    }
  }

  /**
   * 客户端断开连接
   */
  handleDisconnect(client: Socket) {
    const user = client.data.user;
    if (user) {
      console.log(`用户 ${user.id} 断开连接`);
    }
  }

  /**
   * 发送消息
   */
  @SubscribeMessage('send_message')
  @UseGuards(WsJwtGuard)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const user = client.data.user;
    const { content, receiverId, type = 1 } = data;

    if (!user.roomId) {
      client.emit('error', { message: '用户未分配房间' });
      return;
    }

    // 保存消息到数据库
    const message = await this.socketService.saveMessage({
      roomId: user.roomId,
      senderId: user.id,
      receiverId,
      content,
      type,
    });

    // 构建消息对象
    const messageObj = {
      id: message.id,
      senderId: user.id,
      senderName: user.name,
      receiverId,
      content,
      type,
      createdAt: message.createdAt,
    };

    // 发送消息
    if (receiverId) {
      // 私聊：发送给特定用户
      this.server.to(`user:${receiverId}`).emit('receive_message', messageObj);
      client.emit('receive_message', messageObj); // 同时发送给自己
    } else {
      // 群聊：发送给房间内所有用户
      this.server.to(`room:${user.roomId}`).emit('receive_message', messageObj);
    }

    return { success: true, messageId: message.id };
  }

  /**
   * 加入房间
   */
  @SubscribeMessage('join_room')
  @UseGuards(WsJwtGuard)
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number },
  ) {
    const user = client.data.user;
    const { roomId } = data;

    // 验证用户是否有权限加入该房间
    if (user.roomId !== roomId) {
      client.emit('error', { message: '无权限加入该房间' });
      return;
    }

    // 离开之前的房间
    const rooms = Array.from(client.rooms);
    rooms.forEach((room) => {
      if (room.startsWith('room:')) {
        client.leave(room);
      }
    });

    // 加入新房间
    client.join(`room:${roomId}`);
    client.emit('room_joined', { roomId });

    return { success: true, roomId };
  }

  /**
   * 获取在线用户
   */
  @SubscribeMessage('get_online_users')
  @UseGuards(WsJwtGuard)
  async handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    const user = client.data.user;

    if (!user.roomId) {
      return { onlineUsers: [] };
    }

    // 获取房间内的所有客户端
    const roomClients = await this.server.in(`room:${user.roomId}`).fetchSockets();
    const onlineUsers = roomClients.map((client) => client.data.user);

    return { onlineUsers };
  }

  /**
   * 向指定用户推送通知
   */
  sendNotification(userId: number, event: string, payload: object): void {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}