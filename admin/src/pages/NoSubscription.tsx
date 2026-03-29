import { useEffect, useState } from 'react';
import { Card, Button, Radio, Tag, message, Row, Col, Spin } from 'antd';
import { CrownOutlined, CheckCircleOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { subscriptionApi } from '../api';
import { usePlan } from '../store/planContext';

type Cycle = 'monthly' | 'annual';

const features = {
  basic: ['自助入住', '二维码服务', '订单管理', '房间管理', '商品管理', '服务请求'],
  pro: ['以上全部', 'AI 客服助手', '房间智能匹配', '经营数据分析', '财务报表导出'],
};

const displayPrices = {
  basic: { monthly: 299, annual: 2990 },
  pro: { monthly: 999, annual: 9990 },
};

export default function NoSubscription() {
  const [cycle, setCycle] = useState<Cycle>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const navigate = useNavigate();
  const { loadPlan } = usePlan();

  useEffect(() => {
    subscriptionApi.getPlans().then((res: any) => {
      setPlans(res.data?.data || res.data || []);
    }).catch(() => {});
  }, []);

  const handleSelect = async (planSlug: 'basic' | 'pro') => {
    const plan = plans.find((p: any) => p.name === planSlug);
    if (!plan) { message.error('套餐信息加载中，请稍后重试'); return; }
    setLoading(planSlug);
    try {
      const res: any = await subscriptionApi.upgrade(plan.id, cycle, 'alipay');
      const data = res.data?.data || res.data || res;
      if (data?.payUrl) {
        window.location.href = data.payUrl;
      } else {
        await loadPlan();
        navigate('/');
      }
    } catch (e: any) {
      message.error(e?.response?.data?.message || '发起支付失败');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <CrownOutlined style={{ fontSize: 40, color: '#faad14' }} />
        <h1 style={{ marginTop: 12, marginBottom: 4 }}>欢迎使用绿管家</h1>
        <p style={{ color: '#888', marginBottom: 24 }}>请选择您的套餐以开始使用系统</p>
        <Radio.Group
          value={cycle}
          onChange={e => setCycle(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="monthly">月付</Radio.Button>
          <Radio.Button value="annual">年付 <Tag color="success" style={{ marginLeft: 4, fontSize: 11 }}>省2个月</Tag></Radio.Button>
        </Radio.Group>
      </div>

      {plans.length === 0 ? (
        <Spin size="large" />
      ) : (
        <Row gutter={24} style={{ maxWidth: 800, width: '100%' }}>
          <Col xs={24} md={12}>
            <Card
              bordered
              style={{ borderRadius: 12, textAlign: 'center', height: '100%' }}
              styles={{ body: { padding: 32 } }}
            >
              <Tag color="blue" style={{ marginBottom: 12, fontSize: 13 }}>普通会员</Tag>
              <div style={{ fontSize: 36, fontWeight: 700, margin: '8px 0' }}>
                ¥{displayPrices.basic[cycle]}
                <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>/{cycle === 'monthly' ? '月' : '年'}</span>
              </div>
              {cycle === 'annual' && (
                <div style={{ color: '#52c41a', fontSize: 12, marginBottom: 8 }}>省 ¥{displayPrices.basic.monthly * 12 - displayPrices.basic.annual} 元</div>
              )}
              <div style={{ margin: '20px 0', textAlign: 'left' }}>
                {features.basic.map(f => (
                  <div key={f} style={{ padding: '4px 0', fontSize: 13 }}>
                    <CheckCircleOutlined style={{ color: '#1677ff', marginRight: 8 }} />{f}
                  </div>
                ))}
              </div>
              <Button
                type="primary"
                block
                size="large"
                loading={loading === 'basic'}
                onClick={() => handleSelect('basic')}
              >
                选择普通会员
              </Button>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              bordered
              style={{ borderRadius: 12, textAlign: 'center', height: '100%', borderColor: '#faad14', background: '#fffbe6' }}
              styles={{ body: { padding: 32 } }}
            >
              <Tag color="gold" style={{ marginBottom: 12, fontSize: 13 }}>Pro 会员 ✨ 推荐</Tag>
              <div style={{ fontSize: 36, fontWeight: 700, margin: '8px 0' }}>
                ¥{displayPrices.pro[cycle]}
                <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>/{cycle === 'monthly' ? '月' : '年'}</span>
              </div>
              {cycle === 'annual' && (
                <div style={{ color: '#52c41a', fontSize: 12, marginBottom: 8 }}>省 ¥{displayPrices.pro.monthly * 12 - displayPrices.pro.annual} 元</div>
              )}
              <div style={{ margin: '20px 0', textAlign: 'left' }}>
                {features.pro.map(f => (
                  <div key={f} style={{ padding: '4px 0', fontSize: 13 }}>
                    <CheckCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />{f}
                  </div>
                ))}
              </div>
              <Button
                type="primary"
                block
                size="large"
                loading={loading === 'pro'}
                onClick={() => handleSelect('pro')}
                style={{ background: '#faad14', borderColor: '#faad14' }}
              >
                选择 Pro 会员
              </Button>
            </Card>
          </Col>
        </Row>
      )}

      <Card
        bordered
        style={{ marginTop: 24, maxWidth: 800, width: '100%', borderRadius: 12, textAlign: 'center' }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>企业会员 — 专属定制方案</div>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>多酒店管理、API对接、专属客服、SLA保障，价格面议</div>
        <Button icon={<MailOutlined />} href="mailto:sales@lvguanjia.com">
          联系我们
        </Button>
      </Card>

      <div style={{ marginTop: 24, color: '#bbb', fontSize: 12 }}>
        支付完成后套餐立即生效，如有问题请联系客服
      </div>
    </div>
  );
}
