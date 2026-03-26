import { useEffect, useState } from 'react';
import { Table, Select, Space, Tag, message } from 'antd';
import { adminApi } from '../api';
import dayjs from 'dayjs';

const statusText: Record<number, string> = { 1: '待处理', 2: '处理中', 3: '已完成', 4: '已取消' };
const statusColor: Record<number, string> = { 1: 'default', 2: 'processing', 3: 'success', 4: 'error' };

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterHotel, setFilterHotel] = useState<number | undefined>();
  const [filterStatus, setFilterStatus] = useState<number | undefined>();

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.services({ hotelId: filterHotel, status: filterStatus }),
      adminApi.hotels(),
    ]).then(([s, h]: any[]) => {
      setServices(s.data || s || []);
      setHotels(h.data || h || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterHotel, filterStatus]);

  const handleStatus = async (id: number, status: number) => {
    try {
      await adminApi.updateServiceStatus(id, status);
      message.success('状态已更新');
      load();
    } catch (e: any) { message.error(e.message || '失败'); }
  };

  const hotelOptions = [{ value: undefined, label: '全部酒店' }, ...hotels.map((h: any) => ({ value: h.id, label: h.name }))];

  const columns = [
    { title: '酒店', dataIndex: 'hotelId', render: (v: number) => hotels.find((h: any) => h.id === v)?.name || `#${v}` },
    { title: '房间', dataIndex: ['room', 'roomNumber'], key: 'room' },
    { title: '客人', dataIndex: ['user', 'name'], key: 'user' },
    { title: '服务类型', dataIndex: ['type', 'name'], key: 'type' },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '状态', dataIndex: 'status', render: (v: number, r: any) => (
      <Select value={v} style={{ width: 110 }}
        options={Object.entries(statusText).map(([k, label]) => ({ value: Number(k), label }))}
        onChange={(s) => handleStatus(r.id, s)}
      />
    )},
    { title: '提交时间', dataIndex: 'createdAt', render: (v: string) => dayjs(v).format('MM-DD HH:mm') },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>服务请求管理</h2>
        <Space>
          <Select style={{ width: 140 }} value={filterHotel} options={hotelOptions} onChange={setFilterHotel} />
          <Select style={{ width: 110 }} value={filterStatus} placeholder="全部状态" allowClear
            options={[{ value: undefined, label: '全部状态' }, ...Object.entries(statusText).map(([k, label]) => ({ value: Number(k), label }))]}
            onChange={setFilterStatus}
          />
        </Space>
      </div>
      <Table dataSource={services} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
