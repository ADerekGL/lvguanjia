import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import api from '../api';

export type PlanTier = 'none' | 'basic' | 'pro' | 'enterprise';

interface PlanContextValue {
  effectivePlan: PlanTier;
  planLoaded: boolean;
  loadPlan: () => Promise<void>;
}

const PlanContext = createContext<PlanContextValue>({
  effectivePlan: 'none',
  planLoaded: false,
  loadPlan: async () => {},
});

export function PlanProvider({ children }: { children: ReactNode }) {
  const [effectivePlan, setEffectivePlan] = useState<PlanTier>('none');
  const [planLoaded, setPlanLoaded] = useState(false);

  const loadPlan = useCallback(async () => {
    try {
      const res = await api.get('/hotel-admin/subscription');
      const data = res.data;
      let plan: PlanTier = 'none';
      const validStatuses = ['active', 'trial', 'manual'];
      if (validStatuses.includes(data?.status) && data?.plan?.name) {
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
    <PlanContext.Provider value={{ effectivePlan, planLoaded, loadPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
