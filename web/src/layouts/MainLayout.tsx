import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar, Badge } from 'antd-mobile';
import {
  MessageOutline,
  ShopbagOutline,
  UnorderedListOutline,
  UserOutline,
  AppOutline,
  ChatAddOutline,
} from 'antd-mobile-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { connectSocket, onServiceUpdate } from '../services/socket';
import { useAuthStore } from '../store/auth';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuthStore();
  const [serviceUnread, setServiceUnread] = useState(0);

  useEffect(() => {
    if (!token) return;
    const sock = connectSocket(token);
    const off = onServiceUpdate(() => {
      if (!location.pathname.startsWith('/service')) {
        setServiceUnread((n) => n + 1);
      }
    });
    return off;
  }, [token]);

  const tabs = [
    { key: '/', title: '首页', icon: <AppOutline /> },
    { key: '/chat', title: '聊天', icon: <MessageOutline /> },
    { key: '/shop', title: '商城', icon: <ShopbagOutline /> },
    { key: '/orders', title: '订单', icon: <UnorderedListOutline /> },
    {
      key: '/service',
      title: '服务',
      icon: serviceUnread > 0
        ? <Badge content={serviceUnread}><ChatAddOutline /></Badge>
        : <ChatAddOutline />,
    },
    { key: '/profile', title: '我的', icon: <UserOutline /> },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </div>
      <TabBar
        activeKey={location.pathname}
        onChange={(key) => {
          if (key === '/service') setServiceUnread(0);
          navigate(key);
        }}
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
