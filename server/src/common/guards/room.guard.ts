import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoomGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 如果没有用户信息，跳过房间校验（可能是公开接口）
    if (!user) {
      return true;
    }

    // 从请求参数或请求体中获取 room_id
    const requestedRoomId =
      request.params.room_id ||
      request.query.room_id ||
      request.body.room_id;

    // 如果请求中没有 room_id，跳过校验
    if (!requestedRoomId) {
      return true;
    }

    // 获取用户的 room_id
    const userRoomId = user.roomId;

    // 严格校验：用户只能访问自己房间的资源
    if (userRoomId && userRoomId.toString() !== requestedRoomId.toString()) {
      throw new ForbiddenException('跨房间访问禁止');
    }

    // 自动注入 room_id 到查询条件
    if (userRoomId) {
      request.query.room_id = userRoomId;
    }

    return true;
  }
}