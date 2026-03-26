import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  HomeOutlined,
  TeamOutlined,
  ShoppingOutlined,
  ToolOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/rooms', icon: <HomeOutlined />, label: '房间管理' },
  { key: '/users', icon: <TeamOutlined />, label: '客人管理' },
  { key: '/orders', icon: <ShoppingOutlined />, label: '订单管理' },
  { key: '/services', icon: <ToolOutlined />, label: '服务请求' },
  { key: '/products', icon: <AppstoreOutlined />, label: '商品管理' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', fontWeight: 'bold', fontSize: 16, borderBottom: '1px solid #f0f0f0' }}>
          酒店管理系统
        </Header>
        <Content style={{ margin: 24, background: '#f5f5f5', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
