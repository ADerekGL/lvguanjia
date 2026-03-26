import { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, message } from 'antd';
import { serviceApi } from '../api';
import dayjs from 'dayjs';

const statusColor: Record<number, string> = { 1: 'default', 2: 'processing', 3: 'success', 4: 'error' };
const statusText: Record<number, string> = { 1: '待处理', 2: '处理中', 3: '已完成', 4: '已取消' };

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    serviceApi.list().then((res: any) => {
      setServices(res.data || res || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: number, status: number) => {
    try {
      await serviceApi.updateStatus(id, status);
      message.success('状态已更新');
      load();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const columns = [
    { title: '房间', dataIndex: ['room', 'roomNumber'], key: 'room' },
    { title: '客人', dataIndex: ['user', 'name'], key: 'user' },
    { title: '服务类型', dataIndex: ['type', 'name'], key: 'type' },
    { title: '描述', dataIndex: 'description', key: 'desc', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: number) => <Tag color={statusColor[v]}>{statusText[v]}</Tag> },
    { title: '提交时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: '更新状态', key: 'action',
      render: (_: any, r: any) => (
        <Space>
          <Select
            value={r.status}
            style={{ width: 110 }}
            options={Object.entries(statusText).map(([k, v]) => ({ value: Number(k), label: v }))}
            onChange={(s) => handleStatus(r.id, s)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>服务请求管理</h2>
      <Table dataSource={services} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
