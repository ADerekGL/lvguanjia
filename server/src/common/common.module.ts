import { Global, Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { RoomGuard } from './guards/room.guard';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { ErrorFilter } from './filters/error.filter';

@Global()
@Module({
  providers: [JwtAuthGuard, AdminAuthGuard, RoomGuard, ResponseInterceptor, ErrorFilter],
  exports: [JwtAuthGuard, AdminAuthGuard, RoomGuard, ResponseInterceptor, ErrorFilter],
})
export class CommonModule {}