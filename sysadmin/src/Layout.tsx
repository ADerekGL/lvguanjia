import { Layout, Menu, Button, ConfigProvider } from 'antd';
import {
  DashboardOutlined,
  BankOutlined,
  TeamOutlined,
  HomeOutlined,
  ShoppingOutlined,
  ToolOutlined,
  IdcardOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '系统概览' },
  { key: '/hotels', icon: <BankOutlined />, label: '酒店管理' },
  { key: '/users', icon: <TeamOutlined />, label: '用户管理' },
  { key: '/rooms', icon: <HomeOutlined />, label: '房间管理' },
  { key: '/products', icon: <AppstoreOutlined />, label: '商品管理' },
  { key: '/orders', icon: <ShoppingOutlined />, label: '订单管理' },
  { key: '/services', icon: <ToolOutlined />, label: '服务请求' },
  { key: '/checkin', icon: <IdcardOutlined />, label: '入住管理' },
  { key: '/subscriptions', icon: <CrownOutlined />, label: '订阅管理' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={210} style={{ background: '#1b4332' }}>
        <div style={{
          height: 64, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#a8d5a2', fontWeight: 'bold',
          fontSize: 15, borderBottom: '1px solid #2d6a4f', padding: '0 12px',
          textAlign: 'center', lineHeight: '1.3',
        }}>
          旅管家<br /><span style={{ fontSize: 11, fontWeight: 400, opacity: 0.75 }}>系统管理平台</span>
        </div>
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                darkItemBg: '#1b4332',
                darkSubMenuItemBg: '#163d2b',
                darkItemSelectedBg: '#2d6a4f',
                darkItemHoverBg: '#245840',
                darkItemColor: '#d8f3dc',
                darkItemSelectedColor: '#ffffff',
                darkItemHoverColor: '#ffffff',
              },
            },
          }}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ background: '#1b4332', marginTop: 8 }}
          />
        </ConfigProvider>
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff', padding: '0 24px', fontWeight: 'bold',
          fontSize: 16, borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>旅管家 · 系统管理控制台</span>
          <Button icon={<LogoutOutlined />} type="text" onClick={handleLogout}>退出登录</Button>
        </Header>
        <Content style={{ margin: 24, background: '#f5f5f5', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
