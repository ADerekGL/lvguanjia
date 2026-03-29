import { useEffect, useState } from 'react';
import { Table, Select, Space, message, Tag } from 'antd';
import { userApi, roomApi } from '../api';
import dayjs from 'dayjs';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([userApi.list(), roomApi.list()]).then(([u, r]: any[]) => {
      const uData = u.data;
      const raw: any[] = Array.isArray(uData) ? uData[0] : (uData?.items || uData?.users || []);
      setUsers(raw.filter((u: any) => u.status !== 0));
      setRooms(r.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async (userId: number, roomId: number) => {
    try {
      await userApi.update(userId, { roomId });
      message.success('房间分配成功');
      load();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const roomOptions = rooms.map((r: any) => ({
    value: r.id,
    label: `${r.roomNumber} (${r.floor}层) - ${r.status === 1 ? '空闲' : r.status === 2 ? '入住' : '维修'}`,
  }));

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '角色', dataIndex: 'role', key: 'role', render: (v: number) => <Tag color={v === 2 ? 'red' : 'blue'}>{v === 2 ? '管理员' : '客人'}</Tag> },
    { title: '房间', dataIndex: 'roomId', key: 'roomId', render: (v: number) => {
      const room = rooms.find((r: any) => r.id === v);
      return room ? room.roomNumber : (v ? `#${v}` : '未分配');
    }},
    { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    {
      title: '分配房间', key: 'assign',
      render: (_: any, r: any) => (
        <Space>
          <Select
            style={{ width: 200 }}
            placeholder="选择房间"
            value={r.roomId || undefined}
            options={roomOptions}
            onChange={(roomId) => handleAssign(r.id, roomId)}
            allowClear
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <h2 style={{ marginTop: 0 }}>客人管理</h2>
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
