import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Tag, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { adminApi } from '../api';
import dayjs from 'dayjs';

export default function Hotels() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    adminApi.hotels().then((res: any) => {
      setHotels(res.data || res || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: any) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await adminApi.updateHotel(editing.id, values);
        message.success('更新成功');
      } else {
        await adminApi.createHotel(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const toggleStatus = async (id: number, status: number) => {
    await adminApi.updateHotel(id, { status: status === 1 ? 0 : 1 });
    load();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '名称', dataIndex: 'name' },
    { title: '城市', dataIndex: 'city' },
    { title: '省份', dataIndex: 'province' },
    { title: '电话', dataIndex: 'phone' },
    { title: '状态', dataIndex: 'status', render: (v: number, r: any) =>
      <Switch checked={v === 1} onChange={() => toggleStatus(r.id, v)} checkedChildren="营业" unCheckedChildren="停业" />
    },
    { title: '创建时间', dataIndex: 'createdAt', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
    { title: '操作', render: (_: any, r: any) => <Button size="small" onClick={() => openEdit(r)}>编辑</Button> },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>酒店管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增酒店</Button>
      </div>
      <Table dataSource={hotels} columns={columns} rowKey="id" loading={loading} />
      <Modal title={editing ? '编辑酒店' : '新增酒店'} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="酒店名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="city" label="城市" style={{ flex: 1 }}><Input /></Form.Item>
            <Form.Item name="province" label="省份" style={{ flex: 1 }}><Input /></Form.Item>
          </Space>
          <Form.Item name="address" label="地址"><Input /></Form.Item>
          <Form.Item name="phone" label="电话"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select options={[{ value: 1, label: '营业' }, { value: 0, label: '停业' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
