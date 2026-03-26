import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Select, InputNumber, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { roomApi } from '../api';

const typeText: Record<number, string> = { 1: '标准间', 2: '大床房', 3: '套房' };
const statusText: Record<number, string> = { 0: '维修', 1: '空闲', 2: '入住' };
const statusColor: Record<number, string> = { 0: 'error', 1: 'success', 2: 'processing' };

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    roomApi.list().then((res: any) => setRooms(res.data || res || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: any) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };

  const handleSubmit = async () => {
    const vals = await form.validateFields();
    try {
      if (editing) {
        await roomApi.update(editing.id, vals);
        message.success('更新成功');
      } else {
        await roomApi.create(vals);
        message.success('创建成功');
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const handleStatus = async (id: number, status: number) => {
    try {
      await roomApi.updateStatus(id, status);
      message.success('状态已更新');
      load();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const columns = [
    { title: '房间号', dataIndex: 'roomNumber', key: 'roomNumber' },
    { title: '楼层', dataIndex: 'floor', key: 'floor' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v: number) => typeText[v] || v },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: number) => <Tag color={statusColor[v]}>{statusText[v]}</Tag> },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => v ? `¥${Number(v).toFixed(2)}` : '-' },
    {
      title: '操作', key: 'action',
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>编辑</Button>
          {r.status !== 1 && <Button size="small" onClick={() => handleStatus(r.id, 1)}>设为空闲</Button>}
          {r.status !== 2 && <Button size="small" onClick={() => handleStatus(r.id, 2)}>设为入住</Button>}
          {r.status !== 0 && <Button size="small" danger onClick={() => handleStatus(r.id, 0)}>维修</Button>}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>房间管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>添加房间</Button>
      </div>
      <Table dataSource={rooms} columns={columns} rowKey="id" loading={loading} />
      <Modal title={editing ? '编辑房间' : '添加房间'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} okText="保存">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="roomNumber" label="房间号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="floor" label="楼层" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={[{ value: 1, label: '标准间' }, { value: 2, label: '大床房' }, { value: 3, label: '套房' }]} />
          </Form.Item>
          <Form.Item name="price" label="价格">
            <InputNumber style={{ width: '100%' }} min={0} prefix="¥" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
