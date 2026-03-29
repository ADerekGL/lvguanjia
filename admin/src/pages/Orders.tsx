import { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, message } from 'antd';
import { orderApi } from '../api';
import dayjs from 'dayjs';

const statusColor: Record<number, string> = { 1: 'blue', 2: 'orange', 3: 'cyan', 4: 'green', 5: 'default' };
const statusText: Record<number, string> = { 1: '待支付', 2: '已支付', 3: '配送中', 4: '已完成', 5: '已取消' };

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    orderApi.list(1, 100).then((res: any) => {
      const d = res.data;
      setOrders(Array.isArray(d) ? d[0] : (d?.orders || d || []));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: number, status: number) => {
    try {
      await orderApi.updateStatus(id, status);
      message.success('状态已更新');
      load();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', ellipsis: true },
    { title: '房间', dataIndex: ['room', 'roomNumber'], key: 'room' },
    { title: '商品数', dataIndex: 'items', key: 'items', render: (v: any[]) => v?.length || 0 },
    { title: '总金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: number) => <Tag color={statusColor[v]}>{statusText[v]}</Tag> },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: '更新状态', key: 'action',
      render: (_: any, r: any) => (
        <Space>
          <Select
            value={r.status}
            style={{ width: 100 }}
            options={Object.entries(statusText).map(([k, v]) => ({ value: Number(k), label: v }))}
            onChange={(s) => handleStatus(r.id, s)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>订单管理</h2>
      <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
