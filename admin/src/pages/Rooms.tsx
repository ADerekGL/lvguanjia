import { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, message } from 'antd';
import { roomApi } from '../api';

const typeText: Record<number, string> = { 1: '标准间', 2: '大床房', 3: '套房' };
const statusText: Record<number, string> = { 0: '维修', 1: '空闲', 2: '入住' };
const statusColor: Record<number, string> = { 0: 'error', 1: 'success', 2: 'processing' };

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    roomApi.list().then((res: any) => setRooms(res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: number, status: number) => {
    try {
      await roomApi.updateStatus(id, status);
      message.success('状态已更新');
      load();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const columns = [
    { title: '房间号', dataIndex: 'roomNumber', key: 'roomNumber' },
    { title: '楼层', dataIndex: 'floor', key: 'floor' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v: number) => typeText[v] || v },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: number) => <Tag color={statusColor[v]}>{statusText[v]}</Tag> },
    {
      title: '更新状态', key: 'action',
      render: (_: any, r: any) => (
        <Space>
          <Select
            value={r.status}
            style={{ width: 90 }}
            options={Object.entries(statusText).map(([k, v]) => ({ value: Number(k), label: v }))}
            onChange={(s) => handleStatus(r.id, s)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>房间管理</h2>
      <Table dataSource={rooms} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
