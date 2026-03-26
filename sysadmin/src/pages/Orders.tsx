import { useEffect, useState } from 'react';
import { Table, Select, Space, Tag, message } from 'antd';
import { adminApi } from '../api';
import dayjs from 'dayjs';

const statusText: Record<number, string> = { 1: '待支付', 2: '已支付', 3: '配送中', 4: '已完成', 5: '已取消' };
const statusColor: Record<number, string> = { 1: 'blue', 2: 'orange', 3: 'cyan', 4: 'green', 5: 'default' };

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterHotel, setFilterHotel] = useState<number | undefined>();
  const [filterStatus, setFilterStatus] = useState<number | undefined>();

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.orders({ page: 1, limit: 100, hotelId: filterHotel, status: filterStatus }),
      adminApi.hotels(),
    ]).then(([o, h]: any[]) => {
      setOrders(o.data?.orders || o?.orders || []);
      setHotels(h.data || h || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterHotel, filterStatus]);

  const handleStatus = async (id: number, status: number) => {
    try {
      await adminApi.updateOrderStatus(id, status);
      message.success('状态已更新');
      load();
    } catch (e: any) { message.error(e.message || '失败'); }
  };

  const hotelOptions = [{ value: undefined, label: '全部酒店' }, ...hotels.map((h: any) => ({ value: h.id, label: h.name }))];

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', ellipsis: true },
    { title: '酒店', dataIndex: 'hotelId', render: (v: number) => hotels.find((h: any) => h.id === v)?.name || `#${v}` },
    { title: '房间', dataIndex: ['room', 'roomNumber'], key: 'room' },
    { title: '金额', dataIndex: 'totalAmount', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '状态', dataIndex: 'status', render: (v: number, r: any) => (
      <Select value={v} style={{ width: 100 }}
        options={Object.entries(statusText).map(([k, label]) => ({ value: Number(k), label }))}
        onChange={(s) => handleStatus(r.id, s)}
      />
    )},
    { title: '创建时间', dataIndex: 'createdAt', render: (v: string) => dayjs(v).format('MM-DD HH:mm') },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>订单管理</h2>
        <Space>
          <Select style={{ width: 140 }} value={filterHotel} options={hotelOptions} onChange={setFilterHotel} />
          <Select style={{ width: 110 }} value={filterStatus} placeholder="全部状态" allowClear
            options={[{ value: undefined, label: '全部状态' }, ...Object.entries(statusText).map(([k, label]) => ({ value: Number(k), label }))]}
            onChange={setFilterStatus}
          />
        </Space>
      </div>
      <Table dataSource={orders} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
