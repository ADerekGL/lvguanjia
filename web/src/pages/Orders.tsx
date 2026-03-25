import React, { useState, useEffect } from 'react';
import {
  NavBar,
  List,
  Card,
  Tag,
  Space,
  Button,
  Tabs,
  Toast,
} from 'antd-mobile';
import {
  CheckCircleOutline,
  ClockCircleOutline,
  CloseCircleOutline,
  TruckOutline,
} from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { orderApi, paymentApi } from '../services/api';
import { useAuthStore } from '../store/auth';

interface OrderItem {
  id: number;
  productId: number;
  productName?: string;
  price: number;
  quantity: number;
  subtotal?: number;
}

interface Order {
  id: number;
  orderNo: string;
  items: OrderItem[];
  totalAmount: number;
  status: number;
  createdAt: string;
  remark?: string;
}

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: '1', label: '待付款' },
  { key: '2', label: '已付款' },
  { key: '4', label: '已完成' },
  { key: '5', label: '已取消' },
];

const statusColor: Record<number, 'default' | 'warning' | 'primary' | 'success' | 'danger'> = {
  1: 'warning',
  2: 'primary',
  3: 'primary',
  4: 'success',
  5: 'danger',
};

const statusText: Record<number, string> = {
  1: '待付款',
  2: '已付款',
  3: '配送中',
  4: '已完成',
  5: '已取消',
};

const statusIcon: Record<number, React.ReactNode> = {
  1: <ClockCircleOutline />,
  2: <TruckOutline />,
  3: <TruckOutline />,
  4: <CheckCircleOutline />,
  5: <CloseCircleOutline />,
};

const Orders: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    if (!user?.roomId) return;
    setLoading(true);
    try {
      const res: any = await orderApi.list();
      setOrders(res.orders || res.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user?.roomId]);

  const filtered =
    activeTab === 'all'
      ? orders
      : orders.filter((o) => String(o.status) === activeTab);

  const handlePay = async (order: Order) => {
    try {
      await paymentApi.pay(order.id, 1);
      Toast.show({ content: '支付成功', icon: 'success' });
      fetchOrders();
    } catch (e: any) {
      Toast.show({ content: e.message || '支付失败', icon: 'fail' });
    }
  };

  const handleCancel = async (order: Order) => {
    try {
      await orderApi.cancel(order.id);
      Toast.show({ content: '订单已取消', icon: 'success' });
      fetchOrders();
    } catch (e: any) {
      Toast.show({ content: e.message || '取消失败', icon: 'fail' });
    }
  };

  const totalAmount = orders
    .filter((o) => o.status !== 5)
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const pendingCount = orders.filter((o) => o.status === 1).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <NavBar back={null}>我的订单</NavBar>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {STATUS_TABS.map((tab) => (
          <Tabs.Tab key={tab.key} title={tab.label} />
        ))}
      </Tabs>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>加载中...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>暂无订单</div>
        ) : (
          <List>
            {filtered.map((order) => (
              <List.Item key={order.id}>
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>订单号：{order.orderNo}</span>
                    <Tag color={statusColor[order.status] || 'default'}>
                      {statusIcon[order.status]}{' '}{statusText[order.status] || order.status}
                    </Tag>
                  </div>
                  {(order.items || []).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        marginBottom: '4px',
                      }}
                    >
                      <span>{item.productName || `商品#${item.productId}`} x{item.quantity}</span>
                      <span>¥{(Number(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                      borderTop: '1px solid #f0f0f0',
                      paddingTop: '8px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {dayjs(order.createdAt).format('MM-DD HH:mm')}
                    </span>
                    <Space>
                      <span style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
                        合计 ¥{Number(order.totalAmount).toFixed(2)}
                      </span>
                      {order.status === 1 && (
                        <>
                          <Button size="mini" fill="outline" onClick={() => handleCancel(order)}>取消</Button>
                          <Button size="mini" color="primary" onClick={() => handlePay(order)}>去支付</Button>
                        </>
                      )}
                    </Space>
                  </div>
                  {order.remark && (
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>备注：{order.remark}</div>
                  )}
                </Card>
              </List.Item>
            ))}
          </List>
        )}
      </div>

      <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid #eee' }}>
        <Space justify="between" align="center" style={{ width: '100%' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#999' }}>本次消费</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>¥{totalAmount.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#999' }}>订单数量</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{orders.length} 笔</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#999' }}>待支付</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{pendingCount} 笔</div>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default Orders;
