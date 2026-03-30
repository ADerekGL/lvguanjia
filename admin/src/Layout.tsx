import { Layout, Menu, Button } from 'antd';
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
import { menuItems as menuConfig } from './config/menuConfig';

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

  const visibleItems = menuConfig.map(item => ({
    key: item.key,
    icon: iconMap[item.icon],
    label: item.label,
  }));

  const handleLogout = () => {
    localStorage.removeItem('hotel_admin_token');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={200}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 16, borderBottom: '1px solid #333' }}>
          智慧酒店管理后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={visibleItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
          <span style={{ fontWeight: 'bold', fontSize: 16 }}>酒店管理系统</span>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
        </Header>
        <Content style={{ margin: 24, background: '#f5f5f5', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
