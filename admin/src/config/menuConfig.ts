export type PlanTier = 'none' | 'basic' | 'pro' | 'enterprise';

export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  requiredPlan: PlanTier;
}

export const PLAN_RANK: Record<PlanTier, number> = {
  none: 0,
  basic: 1,
  pro: 2,
  enterprise: 3,
};

export const menuItems: MenuItem[] = [
  { key: '/',            label: '仪表盘',   icon: 'DashboardOutlined',  requiredPlan: 'basic' },
  { key: '/checkin',     label: '入住管理', icon: 'SolutionOutlined',   requiredPlan: 'basic' },
  { key: '/rooms',       label: '房间管理', icon: 'HomeOutlined',       requiredPlan: 'basic' },
  { key: '/users',       label: '客人管理', icon: 'TeamOutlined',       requiredPlan: 'basic' },
  { key: '/orders',      label: '订单管理', icon: 'ShoppingOutlined',   requiredPlan: 'basic' },
  { key: '/services',    label: '服务请求', icon: 'ToolOutlined',       requiredPlan: 'basic' },
  { key: '/products',    label: '商品管理', icon: 'AppstoreOutlined',   requiredPlan: 'basic' },
  { key: '/subscription', label: '订阅管理', icon: 'CrownOutlined',    requiredPlan: 'basic' },
];
