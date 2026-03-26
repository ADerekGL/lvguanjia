import { useEffect, useState } from 'react';
import { Table, Select, Space, Button, Modal, Form, Input, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { adminApi } from '../api';
import dayjs from 'dayjs';

export default function CheckIn() {
  const [guests, setGuests] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterHotel, setFilterHotel] = useState<number | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      adminApi.checkins({ hotelId: filterHotel }),
      adminApi.hotels(),
    ]).then(([g, h]: any[]) => {
      setGuests(g.data || g || []);
      setHotels(h.data || h || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterHotel]);

  const onHotelChange = (hotelId: number) => {
    form.setFieldValue('hotelId', hotelId);
    form.setFieldValue('roomNumber', undefined);
    adminApi.rooms({ hotelId }).then((res: any) => {
      const all: any[] = res.data || res || [];
      setRooms(all.filter((r: any) => r.status !== 2)); // exclude occupied
    });
  };

  const handleCheckIn = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      await adminApi.checkIn(values);
      message.success('入住登记成功');
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (e: any) {
      message.error(e.response?.data?.message || e.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (userId: number) => {
    try {
      await adminApi.checkOut(userId);
      message.success('退房成功');
      load();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const hotelOptions = [{ value: undefined, label: '全部酒店' }, ...hotels.map((h: any) => ({ value: h.id, label: h.name }))];

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '姓名', dataIndex: 'name' },
    { title: '手机号', dataIndex: 'phone' },
    { title: '酒店', dataIndex: 'hotelId', render: (v: number) => hotels.find((h: any) => h.id === v)?.name || `#${v}` },
    { title: '房间', dataIndex: ['room', 'roomNumber'], key: 'room', render: (v: string, r: any) => v || (r.roomId ? `#${r.roomId}` : '-') },
    { title: '楼层', dataIndex: ['room', 'floor'], key: 'floor' },
    { title: '状态', dataIndex: 'status', render: (v: number) =>
      <Tag color={v === 1 ? 'success' : 'default'}>{v === 1 ? '在住' : '已退房'}</Tag>
    },
    { title: '登记时间', dataIndex: 'createdAt', render: (v: string) => v ? dayjs(v).format('MM-DD HH:mm') : '-' },
    { title: '操作', key: 'action', render: (_: any, r: any) => (
      r.status === 1 ? (
        <Popconfirm title="确认办理退房？" onConfirm={() => handleCheckOut(r.id)} okText="确认" cancelText="取消">
          <Button size="small" icon={<LogoutOutlined />} danger>退房</Button>
        </Popconfirm>
      ) : '-'
    )},
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <h2 style={{ margin: 0 }}>入住管理</h2>
          <Tag color="blue">{guests.length} 位在住客人</Tag>
        </Space>
        <Space>
          <Select style={{ width: 160 }} value={filterHotel} options={hotelOptions} onChange={setFilterHotel} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setRooms([]); setModalOpen(true); }}>
            登记入住
          </Button>
        </Space>
      </div>
      <Table dataSource={guests} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title="入住登记"
        open={modalOpen}
        onOk={handleCheckIn}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        okText="确认入住"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="hotelId" label="酒店" rules={[{ required: true, message: '请选择酒店' }]}>
            <Select
              placeholder="选择酒店"
              options={hotels.map((h: any) => ({ value: h.id, label: h.name }))}
              onChange={onHotelChange}
            />
          </Form.Item>
          <Form.Item name="roomNumber" label="房间号" rules={[{ required: true, message: '请选择房间' }]}>
            <Select
              placeholder="选择可用房间"
              options={rooms.map((r: any) => ({ value: r.roomNumber, label: `${r.roomNumber} 层${r.floor} (¥${r.price || '-'})` }))}
            />
          </Form.Item>
          <Form.Item name="name" label="客人姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入客人姓名" />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1\d{10}$/, message: '请输入有效手机号' },
          ]}>
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
