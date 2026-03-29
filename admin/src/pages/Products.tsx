import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Select, InputNumber, Space, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { productApi } from '../api';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    productApi.list().then((res: any) => setProducts(res.data || res || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ status: 1 }); setModalOpen(true); };
  const openEdit = (p: any) => { setEditing(p); form.setFieldsValue(p); setModalOpen(true); };

  const handleSubmit = async () => {
    const vals = await form.validateFields();
    try {
      if (editing) {
        await productApi.update(editing.id, vals);
        message.success('更新成功');
      } else {
        await productApi.create(vals);
        message.success('创建成功');
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productApi.delete(id);
      message.success('删除成功');
      load();
    } catch (e: any) {
      message.error(e.message || '删除失败');
    }
  };

  const handleToggle = async (p: any) => {
    await productApi.update(p.id, { status: p.status === 1 ? 0 : 1 });
    message.success(p.status === 1 ? '已下架' : '已上架');
    load();
  };

  const columns = [
    { title: '商品名', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: number) => <Tag color={v === 1 ? 'green' : 'default'}>{v === 1 ? '上架' : '下架'}</Tag> },
    {
      title: '操作', key: 'action',
      render: (_: any, p: any) => (
        <Space>
          <Button size="small" onClick={() => openEdit(p)}>编辑</Button>
          <Button size="small" onClick={() => handleToggle(p)}>{p.status === 1 ? '下架' : '上架'}</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(p.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>商品管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>添加商品</Button>
      </div>
      <Table dataSource={products} columns={columns} rowKey="id" loading={loading} />
      <Modal title={editing ? '编辑商品' : '添加商品'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} okText="保存">
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="商品名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Select options={['零食', '饮品', '日用品', '其他'].map(v => ({ value: v, label: v }))} />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} prefix="¥" />
          </Form.Item>
          <Form.Item name="stock" label="库存" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select options={[{ value: 1, label: '上架' }, { value: 0, label: '下架' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
