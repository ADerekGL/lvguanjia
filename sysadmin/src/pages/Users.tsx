import { useEffect, useState } from 'react';
import { Table, Select, Space, Tag, Switch, message, Tabs, Button, Popconfirm, Badge } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { adminApi } from '../api';
import dayjs from 'dayjs';

const roleText: Record<number, string> = { 1: '客人', 2: '管家', 3: '管理员' };

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterHotel, setFilterHotel] = useState<number | undefined>();
  const [filterRole, setFilterRole] = useState<number | undefined>();
  const [pending, setPending] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.users({ page: 1, limit: 100, hotelId: filterHotel, role: filterRole }),
      adminApi.hotels(),
    ]).then(([u, h]: any[]) => {
      setUsers(u.data?.users || u?.users || []);
      setHotels(h.data?.data || h.data || h || []);
    }).finally(() => setLoading(false));
  };

  const loadPending = () => {
    setPendingLoading(true);
    adminApi.getPendingHotelAdmins().then((res: any) => {
      setPending(res.data?.data || res.data || []);
    }).catch(() => setPending([]))
    .finally(() => setPendingLoading(false));
  };

  useEffect(() => { load(); loadPending(); }, []);
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

  const handleApprove = async (id: number) => {
    try {
      await adminApi.approveHotelAdmin(id);
      message.success('已审核通过');
      loadPending();
      load();
    } catch (e: any) { message.error(e?.response?.data?.message || '操作失败'); }
  };

  const handleReject = async (id: number) => {
    try {
      await adminApi.rejectHotelAdmin(id);
      message.success('已拒绝');
      loadPending();
    } catch (e: any) { message.error(e?.response?.data?.message || '操作失败'); }
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

  const pendingColumns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '姓名', dataIndex: 'name' },
    { title: '手机号', dataIndex: 'phone' },
    { title: '申请酒店', render: (_: any, r: any) => r.hotel?.name || `#${r.hotelId}` },
    { title: '城市', render: (_: any, r: any) => r.hotel?.city || '-' },
    { title: '酒店电话', render: (_: any, r: any) => r.hotel?.phone || '-' },
    { title: '申请时间', dataIndex: 'createdAt', render: (v: string) => v ? dayjs(v).format('MM-DD HH:mm') : '-' },
    {
      title: '操作', render: (_: any, r: any) => (
        <Space>
          <Popconfirm title="确认审核通过？" onConfirm={() => handleApprove(r.id)} okText="通过" cancelText="取消">
            <Button type="primary" size="small" icon={<CheckOutlined />}>通过</Button>
          </Popconfirm>
          <Popconfirm title="确认拒绝该申请？" onConfirm={() => handleReject(r.id)} okText="拒绝" cancelText="取消" okButtonProps={{ danger: true }}>
            <Button danger size="small" icon={<CloseOutlined />}>拒绝</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <Tabs
        items={[
          {
            key: 'users',
            label: '所有用户',
            children: (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <Space>
                    <Select style={{ width: 140 }} value={filterHotel} options={hotelOptions} onChange={setFilterHotel} />
                    <Select style={{ width: 100 }} value={filterRole} placeholder="全部角色"
                      options={[{ value: undefined, label: '全部角色' }, ...Object.entries(roleText).map(([k, label]) => ({ value: Number(k), label }))]}
                      onChange={setFilterRole} allowClear
                    />
                  </Space>
                </div>
                <Table dataSource={users} columns={columns} rowKey="id" loading={loading} />
              </>
            ),
          },
          {
            key: 'pending',
            label: <Badge count={pending.length} offset={[8, 0]}>待审核申请</Badge>,
            children: (
              <Table dataSource={pending} columns={pendingColumns} rowKey="id" loading={pendingLoading} />
            ),
          },
        ]}
      />
    </div>
  );
}
