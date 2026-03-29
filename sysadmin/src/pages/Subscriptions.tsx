import { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Modal, Form, InputNumber,
  Select, message, Space, Tabs, Popconfirm, Input,
} from 'antd';
import { CrownOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { adminApi } from '../api';

const planColor: Record<string, string> = { basic: 'blue', pro: 'gold', enterprise: 'purple' };
const featureLabels: Record<string, string> = {
  ai: 'AI 智能助手', analytics: '高级数据分析', reports: '报表导出',
  checkin: '入住管理', qrcode: '扫码入住', custom: '企业定制',
};

export default function Subscriptions() {
  const [plans, setPlans] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [subsTotal, setSubsTotal] = useState(0);
  const [subsPage, setSubsPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Grant modal
  const [grantVisible, setGrantVisible] = useState(false);
  const [grantHotelId, setGrantHotelId] = useState<number | null>(null);
  const [grantForm] = Form.useForm();
  const [granting, setGranting] = useState(false);

  // Plan edit modal
  const [planVisible, setPlanVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm] = Form.useForm();
  const [savingPlan, setSavingPlan] = useState(false);

  const loadPlans = async () => {
    try {
      const res: any = await adminApi.listPlans();
      setPlans(res.data || res);
    } catch (e: any) {
      message.error('加载套餐失败');
    }
  };

  const loadSubs = async (page = 1) => {
    setLoading(true);
    try {
      const res: any = await adminApi.listSubscriptions(page, 20);
      const data = res.data || res;
      setSubs(data.items || []);
      setSubsTotal(data.total || 0);
    } catch {
      message.error('加载订阅列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
    loadSubs(1);
  }, []);

  const handleGrant = async () => {
    if (!grantHotelId) return;
    try {
      const values = await grantForm.validateFields();
      setGranting(true);
      await adminApi.grantSubscription(grantHotelId, values);
      message.success('授权成功');
      setGrantVisible(false);
      grantForm.resetFields();
      setGrantHotelId(null);
      loadSubs(subsPage);
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(e?.response?.data?.message || '授权失败');
    } finally {
      setGranting(false);
    }
  };

  const handleCancelSub = async (id: number) => {
    try {
      await adminApi.cancelSubscription(id);
      message.success('订阅已取消');
      loadSubs(subsPage);
    } catch {
      message.error('取消失败');
    }
  };

  const handleSavePlan = async () => {
    try {
      const values = await planForm.validateFields();
      setSavingPlan(true);
      if (editingPlan) {
        await adminApi.updatePlan(editingPlan.id, values);
      } else {
        await adminApi.createPlan(values);
      }
      message.success('保存成功');
      setPlanVisible(false);
      planForm.resetFields();
      setEditingPlan(null);
      loadPlans();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error('保存失败');
    } finally {
      setSavingPlan(false);
    }
  };

  const openEditPlan = (plan?: any) => {
    setEditingPlan(plan || null);
    planForm.setFieldsValue(plan ? {
      name: plan.name,
      displayName: plan.displayName,
      priceMonthly: plan.priceMonthly,
      priceAnnual: plan.priceAnnual,
      features: plan.features || [],
    } : { features: [] });
    setPlanVisible(true);
  };

  const subColumns = [
    { title: '酒店ID', dataIndex: 'hotelId', key: 'hotelId', width: 80 },
    {
      title: '酒店', key: 'hotel',
      render: (_: any, r: any) => r.hotel?.name || `酒店#${r.hotelId}`,
    },
    {
      title: '套餐', key: 'plan',
      render: (_: any, r: any) => r.plan
        ? <Tag color={planColor[r.plan.name] || 'default'}>{r.plan.displayName || r.plan.name}</Tag>
        : '-',
    },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v: string) => v === 'active'
        ? <Tag color="success">生效中</Tag>
        : v === 'cancelled' ? <Tag color="default">已取消</Tag>
        : <Tag color="warning">已过期</Tag>,
    },
    {
      title: '到期时间', dataIndex: 'expiresAt', key: 'expiresAt',
      render: (v: string) => v ? new Date(v).toLocaleDateString('zh-CN') : '永久',
    },
    {
      title: '付费周期', dataIndex: 'billingCycle', key: 'billingCycle',
      render: (v: string) => v === 'annual' ? '年付' : '月付',
    },
    {
      title: '操作', key: 'actions',
      render: (_: any, r: any) => (
        <Space>
          <Button
            size="small"
            type="primary"
            onClick={() => { setGrantHotelId(r.hotelId); grantForm.setFieldsValue({ planId: r.plan?.id, billingCycle: r.billingCycle || 'monthly' }); setGrantVisible(true); }}
          >
            修改套餐
          </Button>
          {r.status === 'active' && (
            <Popconfirm title="确认取消该酒店订阅？" onConfirm={() => handleCancelSub(r.id)} okText="确认" cancelText="取消">
              <Button size="small" danger>取消订阅</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const planColumns = [
    { title: '标识', dataIndex: 'name', key: 'name', render: (v: string) => <Tag color={planColor[v] || 'default'}>{v}</Tag> },
    { title: '显示名称', dataIndex: 'displayName', key: 'displayName' },
    { title: '月费 (¥)', dataIndex: 'priceMonthly', key: 'priceMonthly' },
    { title: '年费 (¥)', dataIndex: 'priceAnnual', key: 'priceAnnual' },
    {
      title: '功能', dataIndex: 'features', key: 'features',
      render: (fs: string[]) => (fs || []).map((f) => (
        <Tag key={f} icon={<CheckCircleOutlined />} color="cyan">{featureLabels[f] || f}</Tag>
      )),
    },
    {
      title: '操作', key: 'actions',
      render: (_: any, r: any) => (
        <Button size="small" onClick={() => openEditPlan(r)}>编辑</Button>
      ),
    },
  ];

  return (
    <div>
      <Tabs
        defaultActiveKey="subs"
        items={[
          {
            key: 'subs',
            label: '酒店订阅',
            children: (
              <Card
                title={<span><CrownOutlined style={{ marginRight: 8, color: '#faad14' }} />酒店订阅管理</span>}
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => { grantForm.resetFields(); setGrantHotelId(null); setGrantVisible(true); }}
                  >
                    授权套餐
                  </Button>
                }
              >
                <Table
                  dataSource={subs}
                  columns={subColumns}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    total: subsTotal,
                    pageSize: 20,
                    current: subsPage,
                    onChange: (p) => { setSubsPage(p); loadSubs(p); },
                  }}
                  size="small"
                />
              </Card>
            ),
          },
          {
            key: 'plans',
            label: '套餐管理',
            children: (
              <Card
                title="套餐列表"
                extra={
                  <Space>
                    <Button onClick={() => adminApi.seedPlans().then(() => { message.success('种子数据写入成功'); loadPlans(); }).catch(() => message.error('失败'))}>
                      初始化套餐
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditPlan()}>新建套餐</Button>
                  </Space>
                }
              >
                <Table dataSource={plans} columns={planColumns} rowKey="id" size="small" pagination={false} />
              </Card>
            ),
          },
        ]}
      />

      {/* Grant subscription modal */}
      <Modal
        title="授权/修改套餐"
        open={grantVisible}
        onCancel={() => { setGrantVisible(false); setGrantHotelId(null); grantForm.resetFields(); }}
        onOk={handleGrant}
        okText="确认授权"
        confirmLoading={granting}
      >
        <Form form={grantForm} layout="vertical" style={{ marginTop: 16 }}>
          {!grantHotelId && (
            <Form.Item label="酒店ID" name="hotelIdInput" rules={[{ required: true, message: '请输入酒店ID' }]}>
              <InputNumber min={1} style={{ width: '100%' }} onChange={(v) => setGrantHotelId(v as number)} />
            </Form.Item>
          )}
          <Form.Item label="套餐" name="planId" rules={[{ required: true, message: '请选择套餐' }]}>
            <Select
              options={plans.map((p) => ({ label: `${p.displayName || p.name} (¥${p.priceMonthly}/月)`, value: p.id }))}
              placeholder="选择套餐"
            />
          </Form.Item>
          <Form.Item label="付费周期" name="billingCycle" initialValue="monthly">
            <Select options={[
              { label: '月付 (30天)', value: 'monthly' },
              { label: '年付 (365天)', value: 'annual' },
            ]} />
          </Form.Item>
          <Form.Item label="自定义天数（可选，覆盖周期）" name="durationDays">
            <InputNumber min={1} max={3650} style={{ width: '100%' }} placeholder="留空则按付费周期计算" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Plan edit modal */}
      <Modal
        title={editingPlan ? '编辑套餐' : '新建套餐'}
        open={planVisible}
        onCancel={() => { setPlanVisible(false); setEditingPlan(null); planForm.resetFields(); }}
        onOk={handleSavePlan}
        okText="保存"
        confirmLoading={savingPlan}
      >
        <Form form={planForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="标识" name="name" rules={[{ required: true, message: '请输入标识' }]}>
            <Input placeholder="basic / pro / enterprise" disabled={!!editingPlan} />
          </Form.Item>
          <Form.Item label="显示名称" name="displayName" rules={[{ required: true }]}>
            <Input placeholder="普通会员" />
          </Form.Item>
          <Form.Item label="月费 (¥)" name="priceMonthly" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="年费 (¥)" name="priceAnnual" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="功能权益" name="features">
            <Select
              mode="multiple"
              options={Object.entries(featureLabels).map(([v, l]) => ({ value: v, label: l }))}
              placeholder="选择功能权益"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
