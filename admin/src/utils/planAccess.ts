import { PLAN_RANK, type PlanTier } from '../config/menuConfig';

export function canAccess(requiredPlan: PlanTier, currentPlan: PlanTier): boolean {
  return PLAN_RANK[currentPlan] >= PLAN_RANK[requiredPlan];
}
