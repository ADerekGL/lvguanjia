import React, { useEffect, useState } from 'react';
import { Grid, Card, Button, Space, Tag, Dialog, Toast } from 'antd-mobile';
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
import { authApi } from '../services/api';

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
  const { user, clearAuth } = useAuthStore();
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([]);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  const handleSelfCheckout = async () => {
    const step1 = await Dialog.confirm({
      title: '申请退房',
      content: '请确认您已将房卡/房间钥匙归还前台，确认后将完成退房。',
      confirmText: '已还房卡，确认退房',
      cancelText: '取消',
    });
    if (!step1) return;
    const step2 = await Dialog.confirm({
      title: '再次确认',
      content: '退房后将无法再次使用该房间，确定退房吗？',
      confirmText: '确定退房',
      cancelText: '返回',
    });
    if (!step2) return;
    setCheckingOut(true);
    try {
      await authApi.selfCheckout();
      Toast.show({ content: '退房成功，感谢您的入住！', icon: 'success' });
      clearAuth();
    } catch (e: any) {
      Toast.show({ content: e.message || '退房失败', icon: 'fail' });
    } finally {
      setCheckingOut(false);
    }
  };

  const quickActions = [
    { icon: <MessageFill />, text: '在线客服', color: '#2d6a4f', path: '/chat' },
    { icon: <ShopbagOutline />, text: '酒店商城', color: '#40916c', path: '/shop' },
    { icon: <UnorderedListOutline />, text: '我的订单', color: '#52b788', path: '/orders' },
    { icon: <ChatAddOutline />, text: '客房服务', color: '#2d6a4f', path: '/service' },
    { icon: <GiftOutline />, text: '优惠活动', color: '#40916c' },
    { icon: <UserOutline />, text: '个人中心', color: '#52b788', path: '/profile' },
  ];

  const checkoutAction = user?.roomId
    ? { text: '申请退房', onClick: handleSelfCheckout }
    : null;

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
                background: '#2d6a4f',
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
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d6a4f' }}>旅管家</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{roomNumber} | {displayName}</div>
            </div>
          </div>
        }
        style={{ marginBottom: '16px' }}
      >
        <div style={{ fontSize: '14px', color: '#666', lineHeight: 1.5 }}>
          欢迎使用旅管家服务，我们为您提供贴心的一站式住宿体验。
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
                  background: '#f0f7f4',
                  border: 'none',
                }}
                onClick={() => { if ((action as any).path) navigate((action as any).path); }}
              >
                <div style={{ fontSize: '28px', color: action.color }}>{action.icon}</div>
                <div style={{ fontSize: '12px', color: '#333' }}>{action.text}</div>
              </Button>
            </Grid.Item>
          ))}
        </Grid>
        {checkoutAction && (
          <Button
            block
            color="danger"
            loading={checkingOut}
            onClick={checkoutAction.onClick}
            style={{ marginTop: '12px', borderRadius: '8px' }}
          >
            {checkoutAction.text}
          </Button>
        )}
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
