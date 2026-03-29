import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber,
  Select, Space, message, Tag, Popconfirm, Upload,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { adminApi } from '../api';

const CATEGORIES = ['饮品', '零食', '日用品', '其他'];

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.products(selectedHotel ? { hotelId: selectedHotel } : {})
      .then((res: any) => setProducts(res.data?.data || res.data || res || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    adminApi.hotels().then((res: any) => setHotels(res.data?.data || res.data || res || []));
  }, []);

  useEffect(() => { load(); }, [selectedHotel]);

  const openAdd = () => {
    setEditing(null);
    setImageUrl('');
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setImageUrl(r.image || '');
    form.setFieldsValue(r);
    setModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res: any = await adminApi.uploadImage(file);
      const url = res.data?.url || res.url || '';
      setImageUrl(url);
      form.setFieldValue('image', url);
      message.success('图片上传成功');
    } catch {
      message.error('图片上传失败');
    } finally {
      setUploading(false);
    }
    return false; // prevent antd default upload
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    if (imageUrl) values.image = imageUrl;
    try {
      if (editing) {
        await adminApi.updateProduct(editing.id, values);
        message.success('更新成功');
      } else {
        if (!values.hotelId) {
          message.error('请选择酒店');
          return;
        }
        await adminApi.createProduct(values);
        message.success('创建成功');
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      message.error(e.message || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    await adminApi.deleteProduct(id);
    message.success('删除成功');
    load();
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '图片', dataIndex: 'image', width: 80,
      render: (url: string) => url
        ? <img src={url} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
        : <span style={{ color: '#ccc' }}>无</span>,
    },
    { title: '名称', dataIndex: 'name' },
    { title: '分类', dataIndex: 'category' },
    { title: '价格', dataIndex: 'price', render: (v: number) => `¥${Number(v).toFixed(2)}` },
    { title: '库存', dataIndex: 'stock' },
    {
      title: '状态', dataIndex: 'status',
      render: (v: number) => <Tag color={v === 1 ? 'green' : 'red'}>{v === 1 ? '上架' : '下架'}</Tag>,
    },
    {
      title: '操作',
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
        <Space>
          <h2 style={{ margin: 0 }}>商品管理</h2>
          <Select
            allowClear placeholder="筛选酒店"
            style={{ width: 180 }}
            value={selectedHotel}
            onChange={setSelectedHotel}
            options={hotels.map((h) => ({ value: h.id, label: h.name }))}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增商品</Button>
      </div>
      <Table dataSource={products} columns={columns} rowKey="id" loading={loading} />

      <Modal
        title={editing ? '编辑商品' : '新增商品'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={520}
      >
        <Form form={form} layout="vertical">
          {!editing && (
            <Form.Item name="hotelId" label="所属酒店" rules={[{ required: true }]}>
              <Select options={hotels.map((h) => ({ value: h.id, label: h.name }))} />
            </Form.Item>
          )}
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="category" label="分类" style={{ flex: 1 }}>
              <Select options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue={1} style={{ flex: 1 }}>
              <Select options={[{ value: 1, label: '上架' }, { value: 0, label: '下架' }]} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="price" label="价格" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} precision={2} prefix="¥" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="stock" label="库存" initialValue={0} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="商品图片">
            {imageUrl && (
              <img src={imageUrl} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4, marginBottom: 8, display: 'block' }} />
            )}
            <Upload
              showUploadList={false}
              beforeUpload={handleUpload}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={uploading}>选择图片</Button>
            </Upload>
            <Form.Item name="image" hidden><Input /></Form.Item>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
