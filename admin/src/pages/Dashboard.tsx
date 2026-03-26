import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import { HomeOutlined, ShoppingOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import { roomApi, orderApi, serviceApi } from '../api';
import dayjs from 'dayjs';

const statusColor: Record<number, string> = { 1: 'blue', 2: 'orange', 3: 'green', 4: 'red', 5: 'default' };
const statusText: Record<number, string> = { 1: '待支付', 2: '已支付', 3: '配送中', 4: '已完成', 5: '已取消' };
const svcColor: Record<number, string> = { 1: 'default', 2: 'processing', 3: 'success', 4: 'error' };
const svcText: Record<number, string> = { 1: '待处理', 2: '处理中', 3: '已完成', 4: '已取消' };

export default function Dashboard() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      roomApi.list(),
      orderApi.list(1, 10),
      serviceApi.list(),
    ]).then(([r, o, s]: any[]) => {
      setRooms(r.data || r || []);
      setOrders((o.data?.orders || o?.orders || []).slice(0, 10));
      setServices((s.data || s || []).slice(0, 10));
    }).finally(() => setLoading(false));
  }, []);

  const totalRooms = rooms.length;
  const occupied = rooms.filter((r: any) => r.status === 2).length;
  const available = rooms.filter((r: any) => r.status === 1).length;
  const pendingSvc = services.filter((s: any) => s.status === 1).length;

  const orderColumns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', ellipsis: true },
    { title: '房间', dataIndex: ['room', 'roomNumber'], key: 'room' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: number) => <Tag color={statusColor[v]}>{statusText[v]}</Tag> },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('MM-DD HH:mm') },
  ];

  const svcColumns = [
    { title: '房间', dataIndex: ['room', 'roomNumber'], key: 'room' },
    { title: '类型', dataIndex: ['type', 'name'], key: 'type' },
    { title: '描述', dataIndex: 'description', key: 'desc', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: number) => <Tag color={svcColor[v]}>{svcText[v]}</Tag> },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('MM-DD HH:mm') },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card><Statistic title="总房间" value={totalRooms} prefix={<HomeOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="已入住" value={occupied} prefix={<UserOutlined />} valueStyle={{ color: '#1677ff' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="空闲" value={available} prefix={<HomeOutlined />} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="待处理服务" value={pendingSvc} prefix={<ToolOutlined />} valueStyle={{ color: '#fa8c16' }} /></Card>
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
