import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm, Select } from 'antd';
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { checkinApi, roomApi } from '../api';
import dayjs from 'dayjs';

export default function CheckIn() {
  const [guests, setGuests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    Promise.all([checkinApi.list(), roomApi.list()])
      .then(([g, r]: any[]) => {
        setGuests(g.data || []);
        const all: any[] = r.data || [];
        setRooms(all.filter((rm: any) => rm.status !== 2));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCheckIn = async () => {
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      await checkinApi.create(values);
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
      await checkinApi.remove(userId);
      message.success('退房成功');
      load();
    } catch (e: any) {
      message.error(e.response?.data?.message || e.message || '操作失败');
    }
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '房间号', key: 'room', render: (_: any, r: any) => r.room?.roomNumber || r.roomId || '-' },
    { title: '楼层', key: 'floor', render: (_: any, r: any) => r.room?.floor ? `${r.room.floor}层` : '-' },
    {
      title: '入住时间', dataIndex: 'createdAt', key: 'createdAt',
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '操作', key: 'action',
      render: (_: any, r: any) => (
        <Popconfirm title="确认退房？" onConfirm={() => handleCheckOut(r.id)} okText="确认" cancelText="取消">
          <Button size="small" danger icon={<LogoutOutlined />}>退房</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>入住管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>登记入住</Button>
      </div>
      <Table dataSource={guests} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title="登记入住"
        open={modalOpen}
        onOk={handleCheckIn}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        confirmLoading={submitting}
        okText="确认入住"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="roomId" label="房间号" rules={[{ required: true, message: '请选择房间' }]}>
            <Select
              placeholder="选择可用房间"
              options={rooms.map((r: any) => ({
                value: r.id,
                label: `${r.roomNumber} 层${r.floor} (¥${r.price || '-'})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="name" label="客人姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入客人姓名" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1\d{10}$/, message: '请输入有效手机号' }]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
