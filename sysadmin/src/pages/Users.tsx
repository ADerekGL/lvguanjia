import { useEffect, useState } from 'react';
import { Table, Select, Space, Tag, Switch, message } from 'antd';
import { adminApi } from '../api';
import dayjs from 'dayjs';

const roleText: Record<number, string> = { 1: '客人', 2: '管家', 3: '管理员' };
const roleColor: Record<number, string> = { 1: 'blue', 2: 'purple', 3: 'red' };

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterHotel, setFilterHotel] = useState<number | undefined>();
  const [filterRole, setFilterRole] = useState<number | undefined>();

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.users({ page: 1, limit: 100, hotelId: filterHotel, role: filterRole }),
      adminApi.hotels(),
    ]).then(([u, h]: any[]) => {
      setUsers(u.data?.users || u?.users || []);
      setHotels(h.data || h || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterHotel, filterRole]);

  const handleRole = async (id: number, role: number) => {
    try {
      await adminApi.updateUser(id, { role });
      message.success('角色已更新');
      load();
    } catch (e: any) { message.error(e.message || '失败'); }
  };

  const handleStatus = async (id: number, status: number) => {
    try {
      await adminApi.updateUser(id, { status: status === 1 ? 0 : 1 });
      load();
    } catch (e: any) { message.error(e.message || '失败'); }
  };

  const hotelOptions = [{ value: undefined, label: '全部酒店' }, ...hotels.map((h: any) => ({ value: h.id, label: h.name }))];

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '姓名', dataIndex: 'name' },
    { title: '手机号', dataIndex: 'phone' },
    { title: '酒店', dataIndex: 'hotelId', render: (v: number) => hotels.find((h: any) => h.id === v)?.name || (v ? `#${v}` : '-') },
    { title: '房间', dataIndex: 'roomId', render: (v: number) => v ? `#${v}` : '-' },
    { title: '角色', dataIndex: 'role', render: (v: number, r: any) => (
      <Select value={v} style={{ width: 90 }}
        options={Object.entries(roleText).map(([k, label]) => ({ value: Number(k), label }))}
        onChange={(role) => handleRole(r.id, role)}
      />
    )},
    { title: '状态', dataIndex: 'status', render: (v: number, r: any) =>
      <Switch checked={v === 1} onChange={() => handleStatus(r.id, v)} checkedChildren="正常" unCheckedChildren="禁用" />
    },
    { title: '注册时间', dataIndex: 'createdAt', render: (v: string) => v ? dayjs(v).format('MM-DD HH:mm') : '-' },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>用户管理</h2>
        <Space>
          <Select style={{ width: 140 }} value={filterHotel} options={hotelOptions} onChange={setFilterHotel} />
          <Select style={{ width: 100 }} value={filterRole} placeholder="全部角色"
            options={[{ value: undefined, label: '全部角色' }, ...Object.entries(roleText).map(([k, label]) => ({ value: Number(k), label }))]}
            onChange={setFilterRole} allowClear
          />
        </Space>
      </div>
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
