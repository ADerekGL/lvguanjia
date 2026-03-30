export type PlanTier = 'none' | 'basic' | 'pro' | 'enterprise';

export interface MenuItem {
  key: string;
  label: string;
  icon: string;
}

export const menuItems: MenuItem[] = [
  { key: '/',         label: '仪表盘',   icon: 'DashboardOutlined' },
  { key: '/checkin',  label: '入住管理', icon: 'SolutionOutlined'  },
  { key: '/rooms',    label: '房间管理', icon: 'HomeOutlined'      },
  { key: '/users',    label: '客人管理', icon: 'TeamOutlined'      },
  { key: '/orders',   label: '订单管理', icon: 'ShoppingOutlined'  },
  { key: '/services', label: '服务请求', icon: 'ToolOutlined'      },
  { key: '/products', label: '商品管理', icon: 'AppstoreOutlined'  },
];
