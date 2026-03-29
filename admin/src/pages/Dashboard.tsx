import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd';
import { HomeOutlined, ShoppingOutlined, ToolOutlined, UserOutlined, QrcodeOutlined } from '@ant-design/icons';
import { statsApi, orderApi, serviceApi } from '../api';
import dayjs from 'dayjs';

const { Text } = Typography;

const statusColor: Record<number, string> = { 1: 'blue', 2: 'orange', 3: 'green', 4: 'red', 5: 'default' };
const statusText: Record<number, string> = { 1: '待支付', 2: '已支付', 3: '配送中', 4: '已完成', 5: '已取消' };
const svcColor: Record<number, string> = { 1: 'default', 2: 'processing', 3: 'success', 4: 'error' };
const svcText: Record<number, string> = { 1: '待处理', 2: '处理中', 3: '已完成', 4: '已取消' };

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('hotel_admin_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setHotelId(payload.hotelId ? Number(payload.hotelId) : null);
      } catch {}
    }
    Promise.all([
      statsApi.get(),
      orderApi.list(1, 10),
      serviceApi.list(1, 10),
    ]).then(([s, o, svc]: any[]) => {
      setStats(s.data || {});
      const od = o.data;
      setOrders((Array.isArray(od) ? od[0] : (od?.orders || od || [])).slice(0, 10));
      const sd = svc.data;
      setServices((Array.isArray(sd) ? sd[0] : (sd || [])).slice(0, 10));
    }).finally(() => setLoading(false));
  }, []);

  const guestUrl = hotelId ? `${window.location.origin}/?hotelId=${hotelId}` : null;

  const orderColumns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', ellipsis: true },
    { title: '房间', dataIndex: ['room', 'roomNumber'], key: 'room' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: number) => <Tag color={statusColor[v]}>{statusText[v]}</Tag> },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('MM-DD HH:mm') },
  ];

  const svcColumns = [
    { title: '房间', dataIndex: ['room', 'roomNumber'], key: 'room' },
    { title: '服务类型', dataIndex: ['type', 'name'], key: 'type' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: number) => <Tag color={svcColor[v]}>{svcText[v]}</Tag> },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('MM-DD HH:mm') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {guestUrl && (
        <Card size="small" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <QrcodeOutlined style={{ color: '#52c41a', fontSize: 18 }} />
            <span style={{ fontWeight: 500 }}>客人入住链接（可分享给客人扫码/点击登录）：</span>
            <Text copyable={{ text: guestUrl }} style={{ color: '#1677ff' }}>{guestUrl}</Text>
            <Tag color="green">酒店ID: {hotelId}</Tag>
          </div>
        </Card>
      )}
      <Row gutter={16}>
        <Col span={6}>
          <Card><Statistic title="房间总数" value={stats.totalRooms ?? '-'} prefix={<HomeOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="在住客人" value={stats.totalUsers ?? '-'} prefix={<UserOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="订单总数" value={stats.totalOrders ?? '-'} prefix={<ShoppingOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="待处理服务" value={stats.pendingServices ?? '-'} prefix={<ToolOutlined />} valueStyle={{ color: '#fa8c16' }} /></Card>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="最近订单" extra={<ShoppingOutlined />}>
            <Table dataSource={orders} columns={orderColumns} rowKey="id" pagination={false} size="small" loading={loading} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="最近服务请求" extra={<ToolOutlined />}>
            <Table dataSource={services} columns={svcColumns} rowKey="id" pagination={false} size="small" loading={loading} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
