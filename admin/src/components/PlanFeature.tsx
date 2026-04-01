import React from 'react';
import { Tooltip } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { usePlan } from '../store/planContext';

interface PlanFeatureProps {
  feature: 'checkin' | 'qrcode' | 'ai' | 'analytics' | 'reports' | 'custom';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PLAN_FEATURES: Record<string, string[]> = {
  none: [],
  basic: ['checkin', 'qrcode'],
  pro: ['checkin', 'qrcode', 'ai', 'analytics', 'reports'],
  enterprise: ['checkin', 'qrcode', 'ai', 'analytics', 'reports', 'custom'],
};

export const PlanFeature: React.FC<PlanFeatureProps> = ({ feature, children, fallback }) => {
  const { effectivePlan } = usePlan();
  const isAllowed = (PLAN_FEATURES[effectivePlan] || []).includes(feature);

  if (isAllowed) return <>{children}</>;

  if (fallback !== undefined) return <>{fallback}</>;

  return (
    <Tooltip title="此功能需要更高版本的订阅方案">
      <span style={{ cursor: 'not-allowed', opacity: 0.6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {children}
        <LockOutlined />
      </span>
    </Tooltip>
  );
};