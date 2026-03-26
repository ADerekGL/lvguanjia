import { useEffect, useState } from 'react';
import { Table, Select, Space, Tag, message } from 'antd';
import { adminApi } from '../api';

const typeText: Record<number, string> = { 1: '标准间', 2: '大床房', 3: '套房' };
const statusText: Record<number, string> = { 0: '维修', 1: '空闲', 2: '入住' };
const statusColor: Record<number, string> = { 0: 'error', 1: 'success', 2: 'processing' };

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterHotel, setFilterHotel] = useState<number | undefined>();

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.rooms({ hotelId: filterHotel }),
      adminApi.hotels(),
    ]).then(([r, h]: any[]) => {
      setRooms(r.data || r || []);
      setHotels(h.data || h || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterHotel]);

  const handleStatus = async (id: number, status: number) => {
    try {
      await adminApi.updateRoomStatus(id, status);
      message.success('状态已更新');
      load();
    } catch (e: any) { message.error(e.message || '失败'); }
  };

  const hotelOptions = [{ value: undefined, label: '全部酒店' }, ...hotels.map((h: any) => ({ value: h.id, label: h.name }))];

  const columns = [
    { title: '酒店', dataIndex: 'hotelId', render: (v: number) => hotels.find((h: any) => h.id === v)?.name || `#${v}` },
    { title: '楼层', dataIndex: 'floor', width: 70 },
    { title: '房号', dataIndex: 'roomNumber', width: 80 },
    { title: '类型', dataIndex: 'type', render: (v: number) => typeText[v] || v },
    { title: '价格', dataIndex: 'price', render: (v: number) => v ? `¥${Number(v).toFixed(0)}` : '-' },
    { title: '状态', dataIndex: 'status', render: (v: number, r: any) => (
      <Select value={v} style={{ width: 90 }}
        options={Object.entries(statusText).map(([k, label]) => ({ value: Number(k), label }))}
        onChange={(s) => handleStatus(r.id, s)}
      />
    )},
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>房间管理</h2>
        <Select style={{ width: 160 }} value={filterHotel} options={hotelOptions} onChange={setFilterHotel} />
      </div>
      <Table dataSource={rooms} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
