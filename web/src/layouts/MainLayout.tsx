import React from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import {
  MessageOutline,
  ShopbagOutline,
  UnorderedListOutline,
  UserOutline,
  AppOutline,
  ChatAddOutline,
} from 'antd-mobile-icons';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { key: '/', title: '首页', icon: <AppOutline /> },
  { key: '/chat', title: '聊天', icon: <MessageOutline /> },
  { key: '/shop', title: '商城', icon: <ShopbagOutline /> },
  { key: '/orders', title: '订单', icon: <UnorderedListOutline /> },
  { key: '/service', title: '服务', icon: <ChatAddOutline /> },
  { key: '/profile', title: '我的', icon: <UserOutline /> },
];

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
      <TabBar
        activeKey={location.pathname}
        onChange={(key) => navigate(key)}
        safeArea
      >
        {tabs.map((item) => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
        ))}
      </TabBar>
    </div>
  );
};

export default MainLayout;
