import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin } from 'antd';
import {
  BankOutlined, TeamOutlined, HomeOutlined,
  ShoppingOutlined, ToolOutlined, DollarOutlined,
} from '@ant-design/icons';
import { adminApi } from '../api';
import dayjs from 'dayjs';

const orderStatusText: Record<number, string> = { 1: '待支付', 2: '已支付', 3: '配送中', 4: '已完成', 5: '已取消' };
const orderStatusColor: Record<number, string> = { 1: 'blue', 2: 'orange', 3: 'cyan', 4: 'green', 5: 'default' };

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.stats(),
      adminApi.orders({ page: 1, limit: 20 }),
    ]).then(([s, o]: any[]) => {
      setStats(s.data || s);
      setRecentOrders((o.data?.orders || o?.orders || []));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  const orderCols = [
    { title: '订单号', dataIndex: 'orderNo', ellipsis: true },
    { title: '酒店', dataIndex: ['hotel', 'name'], key: 'hotel' },
    { title: '金额', dataIndex: 'totalAmount', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '状态', dataIndex: 'status', render: (v: number) => <Tag color={orderStatusColor[v]}>{orderStatusText[v]}</Tag> },
    { title: '时间', dataIndex: 'createdAt', render: (v: string) => dayjs(v).format('MM-DD HH:mm') },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card><Statistic title="平台酒店数" value={stats?.totalHotels ?? '-'} prefix={<BankOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="活跃酒店" value={stats?.activeHotels ?? '-'} prefix={<TeamOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="有效订阅" value={stats?.totalSubscriptions ?? '-'} prefix={<ShoppingOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f7fee7' }}>
            <Statistic title="订阅总收入" value={stats?.subscriptionRevenue ?? 0} precision={2} prefix="¥" valueStyle={{ color: '#166534' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
