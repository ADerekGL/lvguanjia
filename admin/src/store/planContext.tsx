import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PlanTier } from '../config/menuConfig';
import { subscriptionApi } from '../api';

interface PlanContextValue {
  effectivePlan: PlanTier;
  planLoaded: boolean;
  loadPlan: () => Promise<void>;
  setPlan: (plan: PlanTier) => void;
}

const PlanContext = createContext<PlanContextValue>({
  effectivePlan: 'none',
  planLoaded: false,
  loadPlan: async () => {},
  setPlan: () => {},
});

export function PlanProvider({ children }: { children: ReactNode }) {
  const [effectivePlan, setEffectivePlan] = useState<PlanTier>('none');
  const [planLoaded, setPlanLoaded] = useState(false);

  const loadPlan = useCallback(async () => {
    const token = localStorage.getItem('hotel_admin_token');
    if (!token) {
      setPlanLoaded(true); // not authenticated — mark as loaded so UI can proceed
      return;
    }
    try {
      const res: any = await subscriptionApi.getCurrent();
      const data = res.data?.data || res.data || res;
      let plan: PlanTier = 'none';
      if (data?.status === 'active' && data?.plan?.name) {
        plan = data.plan.name as PlanTier;
      }
      setEffectivePlan(plan);
    } catch {
      setEffectivePlan('none');
    } finally {
      setPlanLoaded(true);
    }
  }, []);

  return (
    <PlanContext.Provider value={{ effectivePlan, planLoaded, loadPlan, setPlan: setEffectivePlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
