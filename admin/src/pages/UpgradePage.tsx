import { Card, Button, Row, Col, Tag } from 'antd';
import { CheckCircleOutlined, CrownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '../store/planContext';

const planLabel: Record<string, string> = {
  none: '未订阅',
  basic: '普通会员',
  pro: 'Pro 会员',
  enterprise: '企业会员',
};
const planColor: Record<string, string> = {
  none: 'default',
  basic: 'blue',
  pro: 'gold',
  enterprise: 'purple',
};

const basicFeatures = ['自助入住', '二维码服务', '订单管理', '房间管理', '商品管理', '服务请求'];
const proFeatures = ['以上全部', 'AI 客服助手', '房间智能匹配', '经营数据分析', '财务报表导出'];

export default function UpgradePage() {
  const navigate = useNavigate();
  const { effectivePlan } = usePlan();

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <CrownOutlined style={{ fontSize: 36, color: '#faad14' }} />
        <h2 style={{ marginTop: 12, marginBottom: 4 }}>升级到 Pro 会员</h2>
        <div style={{ color: '#888', marginBottom: 12 }}>
          当前套餐：<Tag color={planColor[effectivePlan]}>{planLabel[effectivePlan]}</Tag>
        </div>
        <p style={{ color: '#666' }}>升级 Pro 解锁 AI 客服、智能匹配、数据分析等高级功能</p>
      </div>

      <Row gutter={24}>
        <Col span={12}>
          <Card
            title={<Tag color="blue">普通会员</Tag>}
            bordered
            style={{ borderRadius: 10 }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>¥299<span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>/月</span></div>
            {basicFeatures.map(f => (
              <div key={f} style={{ padding: '3px 0', fontSize: 13 }}>
                <CheckCircleOutlined style={{ color: '#1677ff', marginRight: 8 }} />{f}
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card
            title={<Tag color="gold">Pro 会员 ✨</Tag>}
            bordered
            style={{ borderRadius: 10, borderColor: '#faad14', background: '#fffbe6' }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>¥999<span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>/月</span></div>
            {proFeatures.map(f => (
              <div key={f} style={{ padding: '3px 0', fontSize: 13 }}>
                <CheckCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />{f}
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Button
          type="primary"
          size="large"
          style={{ minWidth: 180, background: '#faad14', borderColor: '#faad14' }}
          onClick={() => navigate('/subscription')}
        >
          立即升级
        </Button>
      </div>
    </div>
  );
}
