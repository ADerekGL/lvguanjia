import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth.token ||
                  client.handshake.headers.authorization;

    if (!token) {
      client.disconnect();
      return false;
    }

    try {
      // 移除 "Bearer " 前缀
      const actualToken = token.replace('Bearer ', '');

      // 验证 JWT
      const payload = this.jwtService.verify(actualToken, {
        secret: this.configService.get('jwt.secret'),
      });

      // 将用户信息附加到socket对象
      client.data.user = {
        id: payload.sub,
        openid: payload.openid,
        role: payload.role,
        roomId: payload.roomId,
        hotelId: payload.hotelId,
      };

      return true;
    } catch (error) {
      client.disconnect();
      return false;
    }
  }
}