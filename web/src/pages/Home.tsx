import React, { useEffect, useState } from 'react';
import { Grid, Card, Button, Space, Tag } from 'antd-mobile';
import {
  MessageFill,
  ShopbagOutline,
  UnorderedListOutline,
  UserOutline,
  ChatAddOutline,
  GiftOutline,
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { serviceApi, roomApi } from '../services/api';

interface ServiceRequest {
  id: string;
  title: string;
  status: number;
}

const statusColor: Record<number, 'success' | 'warning' | 'default' | 'danger'> = {
  3: 'success',
  2: 'warning',
  1: 'default',
  4: 'danger',
};

const statusText: Record<number, string> = {
  3: '已完成',
  2: '进行中',
  1: '待处理',
  4: '已取消',
};

const roomTypeText: Record<number, string> = {
  1: '标准间',
  2: '大床房',
  3: '套房',
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([]);
  const [roomInfo, setRoomInfo] = useState<any>(null);

  const quickActions = [
    { icon: <MessageFill />, text: '在线客服', color: '#1677ff', path: '/chat' },
    { icon: <ShopbagOutline />, text: '酒店商城', color: '#52c41a', path: '/shop' },
    { icon: <UnorderedListOutline />, text: '我的订单', color: '#faad14', path: '/orders' },
    { icon: <ChatAddOutline />, text: '客房服务', color: '#722ed1', path: '/service' },
    { icon: <GiftOutline />, text: '优惠活动', color: '#eb2f96' },
    { icon: <UserOutline />, text: '个人中心', color: '#13c2c2', path: '/profile' },
  ];

  useEffect(() => {
    if (!user?.roomId) return;
    serviceApi.list().then((res: any) => {
      const items = (res.data || res || []).slice(0, 3).map((r: any) => ({
        id: r.id,
        title: r.type?.name || r.serviceType?.name || '服务请求',
        status: r.status,
      }));
      setRecentRequests(items);
    }).catch(() => {});
    roomApi.getById(user.roomId).then((res: any) => {
      setRoomInfo(res.data || res);
    }).catch(() => {});
  }, [user?.roomId]);

  const displayName = user?.name || '尊贵的客人';
  const roomNumber = roomInfo ? `${roomInfo.roomNumber} (${roomTypeText[roomInfo.type] || '标准间'})` : (user?.roomId ? `房间 ${user.roomId}` : '未分配房间');

  return (
    <div style={{ padding: '16px' }}>
      {/* 欢迎区域 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: '#1677ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            >
              {displayName.slice(0, 1)}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>智慧酒店管家</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{roomNumber} | {displayName}</div>
            </div>
          </div>
        }
        style={{ marginBottom: '16px' }}
      >
        <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.5 }}>
          欢迎使用智慧酒店管家服务，我们为您提供贴心的一站式服务体验。
        </div>
      </Card>

      {/* 快捷操作 */}
      <Card title="快捷操作" style={{ marginBottom: '16px' }}>
        <Grid columns={3} gap={16}>
          {quickActions.map((action, index) => (
            <Grid.Item key={index}>
              <Button
                style={{
                  width: '100%',
                  height: '80px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#f9f9f9',
                  border: 'none',
                }}
                onClick={() => action.path && navigate(action.path)}
              >
                <div style={{ fontSize: '28px', color: action.color }}>{action.icon}</div>
                <div style={{ fontSize: '12px', color: '#333' }}>{action.text}</div>
              </Button>
            </Grid.Item>
          ))}
        </Grid>
      </Card>

      {/* 服务状态 */}
      <Card title="服务状态" style={{ marginBottom: '16px' }}>
        {recentRequests.length === 0 ? (
          <div style={{ color: '#999', fontSize: '14px', textAlign: 'center', padding: '8px 0' }}>暂无服务记录</div>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }}>
            {recentRequests.map((req) => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{req.title}</span>
                <Tag color={statusColor[req.status] || 'default'}>{statusText[req.status] || req.status}</Tag>
              </div>
            ))}
          </Space>
        )}
      </Card>

      {/* 最新消息 */}
      <Card title="最新消息">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ fontSize: '14px', color: '#333' }}>
            <div>📢 酒店推出春季特惠活动</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>今天 09:30</div>
          </div>
          <div style={{ fontSize: '14px', color: '#333' }}>
            <div>🎁 欢迎礼包已送达您的房间</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>昨天 15:20</div>
          </div>
          <div style={{ fontSize: '14px', color: '#333' }}>
            <div>⏰ 退房提醒：请在中午12点前办理</div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>昨天 10:15</div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Home;
