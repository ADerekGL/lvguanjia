import { Global, Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RoomGuard } from './guards/room.guard';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { ErrorFilter } from './filters/error.filter';

@Global()
@Module({
  providers: [JwtAuthGuard, RoomGuard, ResponseInterceptor, ErrorFilter],
  exports: [JwtAuthGuard, RoomGuard, ResponseInterceptor, ErrorFilter],
})
export class CommonModule {}