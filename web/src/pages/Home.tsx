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
import { serviceApi, roomApi, authApi } from '../services/api';

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
      Dialog.show({
        title: '退房成功',
        content: (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '16px', marginBottom: '15px' }}>感谢您的入住！</div>
            <div style={{ color: '#666', marginBottom: '20px' }}>您可以为本次入住进行评分：</div>
            <Space direction='vertical' block>
              <Button block color='primary' size='large' onClick={() => { Dialog.clear(); navigate('/rating'); }}>
                立即去评价
              </Button>
              <Button block fill='none' color='default' onClick={() => { Dialog.clear(); clearAuth(); navigate('/login'); }}>
                暂不评价
              </Button>
            </Space>
          </div>
        ),
        closeOnAction: true,
        actions: [
          {
            key: 'confirm',
            text: '我知道了',
          },
        ],
      });
    } catch (e: any) {
      Toast.show({ content: e.message || '退房失败', icon: 'fail' });
    } finally {
      setCheckingOut(false);
    }
  };

  useEffect(() => {
    if (user?.hotelId && user?.roomId) {
      serviceApi.list().then((res: any) => {
        const raw = res.data || res;
        setRecentRequests(Array.isArray(raw) ? raw.slice(0, 3) : []);
      });
      roomApi.getById(user.roomId).then((res: any) => {
        setRoomInfo(res.data || res);
      });
    }
  }, [user]);

  return (
    <div style={{ padding: '16px', paddingBottom: '32px' }}>
      {/* 酒店概览 */}
      <Card style={{ marginBottom: '16px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a' }}>{roomInfo?.hotel?.name || '酒店详情'}</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>欢迎回家，{user?.name}</div>
          </div>
          <Tag color='success' fill='outline' style={{ borderRadius: '4px' }}>在住</Tag>
        </div>
        <Grid columns={3} gap={8}>
          <Grid.Item>
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#999' }}>房间号</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>{roomInfo?.roomNumber || '-'}</div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#999' }}>类型</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>{roomTypeText[roomInfo?.type] || '-'}</div>
            </div>
          </Grid.Item>
          <Grid.Item>
            <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#999' }}>楼层</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>{roomInfo?.floor || '-'}F</div>
            </div>
          </Grid.Item>
        </Grid>
      </Card>

      {/* 快捷操作 */}
      <Card title="快捷服务" style={{ marginBottom: '16px', borderRadius: '12px' }}>
        <Grid columns={4} gap={16}>
          <Grid.Item onClick={() => navigate('/service')}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: '#e7f5ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <ChatAddOutline style={{ fontSize: '24px', color: '#228be6' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#333' }}>申请服务</div>
            </div>
          </Grid.Item>
          <Grid.Item onClick={() => navigate('/shop')}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: '#fff4e6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <ShopbagOutline style={{ fontSize: '24px', color: '#fd7e14' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#333' }}>酒店商城</div>
            </div>
          </Grid.Item>
          <Grid.Item onClick={() => navigate('/orders')}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: '#f3f0ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <UnorderedListOutline style={{ fontSize: '24px', color: '#7950f2' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#333' }}>我的订单</div>
            </div>
          </Grid.Item>
          <Grid.Item onClick={handleSelfCheckout}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: '#fff5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                <GiftOutline style={{ fontSize: '24px', color: '#fa5252' }} />
              </div>
              <div style={{ fontSize: '12px', color: '#333' }}>自助退房</div>
            </div>
          </Grid.Item>
        </Grid>
      </Card>

      {/* 最近申请 */}
      <Card title="最近服务申请" style={{ marginBottom: '16px', borderRadius: '12px' }}>
        {recentRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#999', fontSize: '14px' }}>暂无服务申请</div>
        ) : (
          <Space direction='vertical' block>
            {recentRequests.map(req => (
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