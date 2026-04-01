import { Layout, Menu, Button, ConfigProvider, Alert } from 'antd';
import {
  DashboardOutlined,
  HomeOutlined,
  TeamOutlined,
  ShoppingOutlined,
  ToolOutlined,
  AppstoreOutlined,
  LogoutOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { menuItems as menuConfig } from './config/menuConfig';
import { usePlan } from './store/planContext';
import AiAssistant from './components/AiAssistant';
import api from './api';

const { Sider, Content, Header } = Layout;

const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  HomeOutlined: <HomeOutlined />,
  TeamOutlined: <TeamOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  ToolOutlined: <ToolOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  SolutionOutlined: <SolutionOutlined />,
};

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPro, planLoaded, effectivePlan } = usePlan();

  const visibleItems = menuConfig.map(item => ({
    key: item.key,
    icon: iconMap[item.icon],
    label: item.label,
  }));

  const [expirationInfo, setExpirationInfo] = useState<{ days: number; type: 'warning' | 'error' } | null>(null);

  useEffect(() => {
    api.get('/hotel-admin/subscription').then(res => {
      const sub = res.data;
      if (sub?.endTime) {
        const days = dayjs(sub.endTime).diff(dayjs(), 'day');
        if (days <= 7) {
          setExpirationInfo({ days, type: days <= 0 ? 'error' : 'warning' });
        }
      }
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hotel_admin_token');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#1b4332' }}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a8d5a2',
          fontWeight: 'bold',
          fontSize: 16,
          borderBottom: '1px solid #2d6a4f',
        }}>
          旅管家 · 酒店管理
        </div>
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                darkItemBg: '#1b4332',
                darkItemColor: '#a8d5a2',
                darkItemSelectedBg: '#2d6a4f',
                darkItemSelectedColor: '#fff',
              },
            },
          }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={visibleItems}
            onClick={({ key }) => navigate(key)}
          />
        </ConfigProvider>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, marginRight: 24 }}>
            {expirationInfo && (
              <Alert
                type={expirationInfo.type}
                showIcon
                message={
                  expirationInfo.type === 'error'
                    ? `您的订阅已于 ${Math.abs(expirationInfo.days)} 天前到期，请立即续费以恢复功能。`
                    : `您的订阅将于 ${expirationInfo.days} 天后到期，请及时续费。`
                }
                action={<Button size="small" type="link" onClick={() => navigate('/subscription')}>立即续费</Button>}
                style={{ margin: '8px 0' }}
              />
            )}
          </div>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
        </Header>
        <Content style={{ margin: 24, background: '#f5f5f5', minHeight: 280, position: 'relative' }}>
          {!planLoaded ? null : effectivePlan === 'none' ? (
            <Alert
              message="订阅已过期或未启用"
              description="您的酒店当前没有有效的订阅方案，部分高级功能已锁定。请前往“我的订阅”进行续费。"
              type="warning"
              showIcon
              action={<Button size="small" type="primary" onClick={() => navigate('/subscription')}>立即购买</Button>}
              style={{ marginBottom: 16 }}
            />
          ) : !isPro && (
            <Alert
              message="当前为基础版方案"
              description="升级到 Pro 方案即可解锁 AI 智能管家、高级报表分析等专属功能。"
              type="info"
              showIcon
              action={<Button size="small" ghost type="primary" onClick={() => navigate('/subscription')}>查看升级</Button>}
              style={{ marginBottom: 16 }}
            />
          )}
          <Outlet />
          <AiAssistant />
        </Content>
      </Layout>
    </Layout>
  );
}