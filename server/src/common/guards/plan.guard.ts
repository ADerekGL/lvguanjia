import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUIRE_FEATURE_KEY } from '../decorators/require-feature.decorator';
import { Hotel } from '@/entities';

const PLAN_FEATURES: Record<string, string[]> = {
  none: [],
  basic: ['checkin', 'qrcode'],
  pro: ['checkin', 'qrcode', 'ai', 'analytics', 'reports'],
  enterprise: ['checkin', 'qrcode', 'ai', 'analytics', 'reports', 'custom'],
};

@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Hotel)
    private hotelRepository: Repository<Hotel>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<string>(REQUIRE_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!feature) return true;

    const request = context.switchToHttp().getRequest();
    const hotelId: number | undefined = request.user?.hotelId;

    if (!hotelId) {
      throw new ForbiddenException({
        message: 'Pro plan required',
        upgradeUrl: '/hotel-admin/subscription/plans',
      });
    }

    const hotel = await this.hotelRepository.findOne({ where: { id: hotelId } });
    const effectivePlan = hotel?.effectivePlan || 'none';
    const allowed = (PLAN_FEATURES[effectivePlan] || []).includes(feature);

    if (!allowed) {
      throw new ForbiddenException({
        message: 'Pro plan required',
        upgradeUrl: '/hotel-admin/subscription/plans',
      });
    }

    return true;
  }
}
