import { Navigate } from 'react-router-dom';
import { canAccess } from '../utils/planAccess';
import { usePlan } from '../store/planContext';
import type { PlanTier } from '../config/menuConfig';

interface Props {
  requiredPlan: PlanTier;
  children: React.ReactNode;
}

export function PlanRoute({ requiredPlan, children }: Props) {
  const { effectivePlan } = usePlan();
  if (!canAccess(requiredPlan, effectivePlan)) {
    return <Navigate to="/upgrade" replace />;
  }
  return <>{children}</>;
}
