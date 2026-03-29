import { useEffect, useState } from 'react';
import { Card, Button, Tag, Table, Modal, Radio, message, Spin, Descriptions, Space, Select } from 'antd';
import { CrownOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { subscriptionApi } from '../api';

const planColor: Record<string, string> = {
  basic: 'blue',
  pro: 'gold',
  enterprise: 'purple',
};

const planSlug = (plan: any) => plan?.name || '';

const featureLabels: Record<string, string> = {
  ai: 'AI 智能助手',
  analytics: '高级数据分析',
  reports: '报表导出',
  checkin: '入住管理',
  qrcode: '扫码入住',
  multiHotel: '多酒店管理',
  prioritySupport: '优先客服支持',
  custom: '企业定制',
};

export default function Subscription() {
  const [current, setCurrent] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeVisible, setUpgradeVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat'>('alipay');
  const [upgrading, setUpgrading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [subRes, plansRes, ordersRes] = await Promise.all([
        subscriptionApi.getCurrent(),
        subscriptionApi.getPlans(),
        subscriptionApi.getOrders(),
      ]);
      setCurrent((subRes as any).data || subRes);
      setPlans((plansRes as any).data || plansRes);
      setOrders((ordersRes as any).data || ordersRes);
    } catch (e: any) {
      message.error(e?.response?.data?.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setUpgrading(true);
    try {
      const res: any = await subscriptionApi.upgrade(selectedPlan, billingCycle, paymentMethod);
      const data = res.data || res;
      if (data.payUrl) {
        window.location.href = data.payUrl;
      } else {
        message.success('订阅升级成功');
        setUpgradeVisible(false);
        load();
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || '升级失败');
    } finally {
      setUpgrading(false);
    }
  };

  const orderColumns = [
    { title: '订单号', dataIndex: 'tradeNo', key: 'tradeNo', width: 200 },
    { title: '套餐', dataIndex: ['plan', 'name'], key: 'plan', render: (_: any, r: any) => r.plan?.displayName || r.plan?.name || '-' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v}` },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (v: string) => v === 'paid' ? <Tag color="success">已支付</Tag> : v === 'refunded' ? <Tag color="error">已退款</Tag> : v === 'failed' ? <Tag color="error">失败</Tag> : <Tag color="processing">待支付</Tag>,
    },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', render: (v: string) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
  ];

  if (loading) return <Spin style={{ display: 'block', margin: '80px auto' }} />;

  const currentPlan = current?.plan;
  const features: string[] = currentPlan?.features || [];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Card
        title={<span><CrownOutlined style={{ marginRight: 8, color: '#faad14' }} />当前订阅</span>}
        extra={
          <Button type="primary" onClick={() => { setSelectedPlan(null); setUpgradeVisible(true); }}>
            升级套餐
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        {current?.plan ? (
          <Descriptions column={2}>
            <Descriptions.Item label="套餐">
              <Tag color={planColor[planSlug(currentPlan)] || 'default'} style={{ fontSize: 14, padding: '2px 10px' }}>
                {currentPlan?.displayName || currentPlan?.name || '-'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {current.status === 'active'
                ? <Tag color="success">生效中</Tag>
                : <Tag color="default">已过期</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="月费">¥{currentPlan?.priceMonthly ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="到期时间">
              {current.expiresAt ? new Date(current.expiresAt).toLocaleDateString('zh-CN') : '永久'}
            </Descriptions.Item>
            <Descriptions.Item label="已开通功能" span={2}>
              <Space wrap>
                {features.length === 0 ? '-' : features.map((f: string) => (
                  <Tag key={f} icon={<CheckCircleOutlined />} color="cyan">{featureLabels[f] || f}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ color: '#999', textAlign: 'center', padding: '16px 0' }}>暂无订阅，请升级套餐</div>
        )}
      </Card>

      <Card title="订购记录" style={{ marginBottom: 24 }}>
        <Table
          dataSource={Array.isArray(orders) ? orders : []}
          columns={orderColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="small"
        />
      </Card>

      <Modal
        title="选择套餐"
        open={upgradeVisible}
        onCancel={() => setUpgradeVisible(false)}
        onOk={handleUpgrade}
        okText="确认升级"
        confirmLoading={upgrading}
        okButtonProps={{ disabled: !selectedPlan }}
        width={700}
      >
        <Space style={{ marginBottom: 16 }}>
          <span>付费周期：</span>
          <Select
            value={billingCycle}
            onChange={(v) => setBillingCycle(v)}
            options={[
              { label: '月付', value: 'monthly' },
              { label: '年付（享8折）', value: 'annual' },
            ]}
            style={{ width: 140 }}
          />
          <span style={{ marginLeft: 12 }}>支付方式：</span>
          <Select
            value={paymentMethod}
            onChange={(v) => setPaymentMethod(v)}
            options={[
              { label: '支付宝', value: 'alipay' },
              { label: '微信支付', value: 'wechat' },
            ]}
            style={{ width: 120 }}
          />
        </Space>
        <Radio.Group
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          style={{ width: '100%' }}
        >
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {plans.map((plan: any) => {
              const isCurrentPlan = currentPlan?.id === plan.id;
              const slug = plan.name || '';
              return (
                <Radio.Button
                  key={plan.id}
                  value={plan.id}
                  disabled={isCurrentPlan}
                  style={{
                    height: 'auto',
                    padding: '16px',
                    flex: '1 1 180px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    lineHeight: 1.6,
                    borderRadius: 8,
                  }}
                >
                  <div>
                    <Tag color={planColor[slug] || 'default'} style={{ marginBottom: 6 }}>{plan.displayName || plan.name}</Tag>
                    {isCurrentPlan && <Tag color="green" style={{ marginLeft: 4 }}>当前套餐</Tag>}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 'bold', color: '#1677ff' }}>
                    ¥{billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly}
                    <span style={{ fontSize: 12, color: '#999', fontWeight: 'normal' }}>
                      {billingCycle === 'annual' ? '/年' : '/月'}
                    </span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    {(plan.features || []).map((f: string) => (
                      <div key={f} style={{ fontSize: 12, color: '#555' }}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                        {featureLabels[f] || f}
                      </div>
                    ))}
                    {(plan.features || []).length === 0 && (
                      <div style={{ fontSize: 12, color: '#999' }}>基础功能</div>
                    )}
                  </div>
                </Radio.Button>
              );
            })}
          </div>
        </Radio.Group>
      </Modal>
    </div>
  );
}
