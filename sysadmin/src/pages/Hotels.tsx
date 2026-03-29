import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, message, Tag, InputNumber, Switch, Drawer, Descriptions, Divider, Popconfirm } from 'antd';
import { PlusOutlined, QrcodeOutlined, SettingOutlined, CrownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { adminApi } from '../api';

export default function Hotels() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [qrModal, setQrModal] = useState<{ open: boolean; dataUrl: string; loginUrl: string; name: string }>(
    { open: false, dataUrl: '', loginUrl: '', name: '' },
  );
  const [initModal, setInitModal] = useState<{ open: boolean; hotel: any }>({ open: false, hotel: null });
  const [initForm] = Form.useForm();
  const [initLoading, setInitLoading] = useState(false);

  // Privilege drawer state
  const [privDrawer, setPrivDrawer] = useState<{ open: boolean; hotel: any; data: any }>({
    open: false, hotel: null, data: null,
  });
  const [privForm] = Form.useForm();
  const [privLoading, setPrivLoading] = useState(false);
  const [privSaving, setPrivSaving] = useState(false);
  const [privRevoking, setPrivRevoking] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi.hotels().then((res: any) => {
      setHotels(res.data?.data || res.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: any) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };

  const showQr = async (hotel: any) => {
    try {
      const res: any = await adminApi.getHotelQrCode(hotel.id);
      const { dataUrl, loginUrl } = res.data?.data || res.data;
      setQrModal({ open: true, dataUrl, loginUrl, name: hotel.name });
    } catch {
      message.error('生成二维码失败');
    }
  };

  const openInit = (hotel: any) => {
    initForm.resetFields();
    initForm.setFieldsValue({ floors: 5, roomsPerFloor: 10 });
    setInitModal({ open: true, hotel });
  };

  const handleInit = async () => {
    const values = await initForm.validateFields();
    setInitLoading(true);
    try {
      const res: any = await adminApi.initHotel(initModal.hotel.id, values.floors, values.roomsPerFloor);
      const { rooms, serviceTypes } = res.data?.data || res.data;
      message.success(`初始化完成：新增 ${rooms} 间客房，${serviceTypes} 种服务类型`);
      setInitModal({ open: false, hotel: null });
      load();
    } catch (e: any) {
      message.error(e.response?.data?.message || '初始化失败');
    } finally {
      setInitLoading(false);
    }
  };

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

  const openPrivilege = async (hotel: any) => {
    setPrivDrawer({ open: true, hotel, data: null });
    setPrivLoading(true);
    try {
      const res: any = await adminApi.getHotelPrivilege(hotel.id);
      const data = res.data?.data || res.data || res;
      setPrivDrawer({ open: true, hotel, data });
      privForm.setFieldsValue({ planName: data.effectivePlan, reason: '' });
    } catch {
      message.error('加载权益信息失败');
    } finally {
      setPrivLoading(false);
    }
  };

  const handleSetPrivilege = async () => {
    try {
      const values = await privForm.validateFields();
      setPrivSaving(true);
      await adminApi.setHotelPrivilege(privDrawer.hotel.id, values);
      message.success('权益设置成功');
      const res: any = await adminApi.getHotelPrivilege(privDrawer.hotel.id);
      const data = res.data?.data || res.data || res;
      setPrivDrawer((d) => ({ ...d, data }));
      privForm.setFieldsValue({ planName: data.effectivePlan, reason: '' });
      load();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '设置失败');
    } finally {
      setPrivSaving(false);
    }
  };

  const handleRevokePrivilege = async () => {
    setPrivRevoking(true);
    try {
      await adminApi.revokeHotelPrivilege(privDrawer.hotel.id);
      message.success('已撤销至未订阅状态');
      const res: any = await adminApi.getHotelPrivilege(privDrawer.hotel.id);
      const data = res.data?.data || res.data || res;
      setPrivDrawer((d) => ({ ...d, data }));
      privForm.setFieldsValue({ planName: data.effectivePlan, reason: '' });
      load();
    } catch {
      message.error('撤销失败');
    } finally {
      setPrivRevoking(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '酒店名称', dataIndex: 'name' },
    { title: '城市', dataIndex: 'city' },
    { title: '省份', dataIndex: 'province' },
    { title: '电话', dataIndex: 'phone' },
    {
      title: '状态', dataIndex: 'status',
      render: (v: number, r: any) => (
        <Switch checked={v === 1} onChange={() => toggleStatus(r.id, v)} checkedChildren="营业" unCheckedChildren="停业" />
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-' },
    {
      title: '操作', render: (_: any, r: any) => (
        <Space>
          <Button size="small" onClick={() => openEdit(r)}>编辑</Button>
          <Button size="small" icon={<QrcodeOutlined />} onClick={() => showQr(r)}>二维码</Button>
          <Button size="small" icon={<SettingOutlined />} onClick={() => openInit(r)}>初始化</Button>
          <Button size="small" icon={<CrownOutlined />} type="link" onClick={() => openPrivilege(r)}>权益</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>酒店管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增酒店</Button>
      </div>
      <Table rowKey="id" columns={columns} dataSource={hotels} loading={loading} />

      {/* 新增/编辑酒店 */}
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

      {/* 二维码弹窗 */}
      <Modal
        title={`${qrModal.name} — 入住扫码`}
        open={qrModal.open}
        onCancel={() => setQrModal(q => ({ ...q, open: false }))}
        footer={null}
        width={360}
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          {qrModal.dataUrl && <img src={qrModal.dataUrl} alt="QR" style={{ width: 260 }} />}
          <div style={{ marginTop: 12, fontSize: 12, color: '#888', wordBreak: 'break-all' }}>
            {qrModal.loginUrl}
          </div>
          <Button
            style={{ marginTop: 12 }}
            onClick={() => {
              const a = document.createElement('a');
              a.href = qrModal.dataUrl;
              a.download = `${qrModal.name}-qrcode.png`;
              a.click();
            }}
          >下载二维码</Button>
        </div>
      </Modal>

      {/* 初始化向导弹窗 */}
      <Modal
        title={`初始化配置 — ${initModal.hotel?.name || ''}`}
        open={initModal.open}
        onOk={handleInit}
        confirmLoading={initLoading}
        onCancel={() => setInitModal({ open: false, hotel: null })}
        okText="开始初始化"
      >
        <p style={{ color: '#888', marginBottom: 16 }}>
          将自动批量创建客房和默认服务类型。已存在的房间号和服务类型会跳过，不会重复创建。
        </p>
        <Form form={initForm} layout="vertical">
          <Space style={{ width: '100%' }} size={16}>
            <Form.Item name="floors" label="楼层数" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} max={99} style={{ width: '100%' }} addonAfter="层" />
            </Form.Item>
            <Form.Item name="roomsPerFloor" label="每层房间数" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={1} max={50} style={{ width: '100%' }} addonAfter="间" />
            </Form.Item>
          </Space>
          <div style={{ background: '#f6f8fa', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#555' }}>
            <div>默认服务类型（6种）：客房清洁、送餐服务、维修报修、叫醒服务、行李寄存、洗衣服务</div>
            <div style={{ marginTop: 6 }}>房间类型按序循环：标准间 → 大床房 → 套房</div>
            <div style={{ marginTop: 6 }}>房价：标准间 ¥299 / 大床房 ¥399 / 套房 ¥499</div>
          </div>
        </Form>
      </Modal>

      {/* 权益管理抽屉 */}
      <Drawer
        title={<span><CrownOutlined style={{ color: '#faad14', marginRight: 8 }} />权益管理 — {privDrawer.hotel?.name}</span>}
        open={privDrawer.open}
        onClose={() => setPrivDrawer({ open: false, hotel: null, data: null })}
        width={480}
        footer={
          <Space>
            <Button type="primary" loading={privSaving} onClick={handleSetPrivilege}>保存设置</Button>
            <Popconfirm
              title="确认撤销该酒店套餐至未订阅（none）状态？"
              onConfirm={handleRevokePrivilege}
              okText="确认撤销"
              cancelText="取消"
            >
              <Button danger loading={privRevoking}>强制降级至未订阅</Button>
            </Popconfirm>
          </Space>
        }
      >
        {privLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : privDrawer.data ? (
          <>
            <Descriptions column={1} bordered size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="当前生效套餐">
                <Tag color={privDrawer.data.effectivePlan === 'none' ? 'default' : privDrawer.data.effectivePlan === 'basic' ? 'blue' : privDrawer.data.effectivePlan === 'pro' ? 'gold' : 'purple'}>
                  {privDrawer.data.effectivePlan || 'none'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="来源">
                {privDrawer.data.planOverride
                  ? <Tag color="orange">手动 Override</Tag>
                  : <Tag color="green">订阅驱动</Tag>}
              </Descriptions.Item>
              {privDrawer.data.planOverrideNote && (
                <Descriptions.Item label="Override 备注">{privDrawer.data.planOverrideNote}</Descriptions.Item>
              )}
              {privDrawer.data.planOverrideAt && (
                <Descriptions.Item label="Override 时间">
                  {dayjs(privDrawer.data.planOverrideAt).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              )}
            </Descriptions>

            {privDrawer.data.subscription ? (
              <>
                <Divider style={{ fontSize: 13 }}>关联订阅</Divider>
                <Descriptions column={1} bordered size="small" style={{ marginBottom: 20 }}>
                  <Descriptions.Item label="套餐">{privDrawer.data.subscription.planName}</Descriptions.Item>
                  <Descriptions.Item label="周期">{privDrawer.data.subscription.billingCycle === 'annual' ? '年付' : '月付'}</Descriptions.Item>
                  <Descriptions.Item label="状态">
                    {privDrawer.data.subscription.status === 'active'
                      ? <Tag color="success">生效中</Tag>
                      : <Tag color="default">{privDrawer.data.subscription.status}</Tag>}
                  </Descriptions.Item>
                  <Descriptions.Item label="到期时间">
                    {privDrawer.data.subscription.expiresAt
                      ? dayjs(privDrawer.data.subscription.expiresAt).format('YYYY-MM-DD')
                      : '永久'}
                  </Descriptions.Item>
                </Descriptions>
              </>
            ) : (
              <div style={{ color: '#999', marginBottom: 20, padding: '8px 0' }}>暂无有效订阅记录</div>
            )}

            <Divider style={{ fontSize: 13 }}>手动设置套餐等级</Divider>
            <Form form={privForm} layout="vertical">
              <Form.Item label="目标套餐等级" name="planName" rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'none', label: '未订阅 (none)' },
                    { value: 'basic', label: '普通会员 (basic)' },
                    { value: 'pro', label: 'Pro 会员 (pro)' },
                    { value: 'enterprise', label: '企业会员 (enterprise)' },
                  ]}
                />
              </Form.Item>
              <Form.Item label="操作原因" name="reason" rules={[{ required: true, min: 4, message: '请填写原因（至少4字）' }]}>
                <Input.TextArea rows={3} placeholder="请填写操作原因，将被记录留存" />
              </Form.Item>
            </Form>
          </>
        ) : null}
      </Drawer>
    </div>
  );
}
