import { useEffect, useState } from 'react';
import { Table, Select, Space, message, Tag, Button, Modal, Input } from 'antd';
import { userApi, roomApi, checkinApi } from '../api';
import dayjs from 'dayjs';

const { Search } = Input;

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = (searchText?: string) => {
    setLoading(true);
    Promise.all([userApi.list(1, 100, searchText), roomApi.list()]).then(([u, r]: any[]) => {
      const uData = u.data;
      const raw: any[] = Array.isArray(uData) ? uData[0] : (uData?.items || uData?.users || []);
      // No manual filter needed if backend filters correctly, but keeping it for safety
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

  const handleCheckout = async (userId: number) => {
    Modal.confirm({
      title: '确认强制退房？',
      content: '强制退房将立即释放房间并断开用户关联，此操作不可撤销。',
      okText: '确认退房',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await checkinApi.remove(userId);
          message.success('强制退房成功');
          load();
        } catch (e: any) {
          message.error(e.response?.data?.message || '退房失败');
        }
      }
    });
  };

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
            style={{ width: 140 }}
            placeholder="选择房间"
            value={r.roomId || undefined}
            options={roomOptions}
            onChange={(roomId) => handleAssign(r.id, roomId)}
            allowClear
          />
          {r.roomId && (
            <Button type="link" danger onClick={() => handleCheckout(r.id)}>强制退房</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>客人管理</h2>
        <Search
          placeholder="搜索姓名或手机号"
          allowClear
          onSearch={(val) => { load(val); }}
          style={{ width: 300 }}
        />
      </div>
      <Table dataSource={users} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
}
