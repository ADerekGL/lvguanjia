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
        <Col span={4}>
          <Card><Statistic title="酒店总数" value={stats?.totalHotels ?? '-'} prefix={<BankOutlined />} /></Card>
        </Col>
        <Col span={4}>
          <Card><Statistic title="用户总数" value={stats?.totalUsers ?? '-'} prefix={<TeamOutlined />} /></Card>
        </Col>
        <Col span={4}>
          <Card><Statistic title="房间总数" value={stats?.totalRooms ?? '-'} prefix={<HomeOutlined />} /></Card>
        </Col>
        <Col span={4}>
          <Card><Statistic title="订单总数" value={stats?.totalOrders ?? '-'} prefix={<ShoppingOutlined />} /></Card>
        </Col>
        <Col span={4}>
          <Card><Statistic title="待处理服务" value={stats?.pendingServices ?? '-'} prefix={<ToolOutlined />} valueStyle={{ color: '#ff4d4f' }} /></Card>
        </Col>
        <Col span={4}>
          <Card><Statistic title="总收入" value={stats?.totalRevenue ?? 0} prefix={<DollarOutlined />} precision={2} valueStyle={{ color: '#3f8600' }} /></Card>
        </Col>
      </Row>
      <Card title="最近订单" style={{ marginTop: 16 }}>
        <Table dataSource={recentOrders} columns={orderCols} rowKey="id" pagination={false} size="small" />
      </Card>
    </div>
  );
}
