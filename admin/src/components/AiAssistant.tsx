import { useState } from 'react';
import { Button, Modal, Input, List, Spin, Avatar, Drawer, FloatButton } from 'antd';
import { RobotOutlined, SendOutlined } from '@ant-design/icons';
import { usePlan } from '../store/planContext';
import api from '../api';

export default function AiAssistant() {
  const { isPro } = usePlan();
  const [visible, setVisible] = useState(false);
  const [promoVisible, setPromoVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'ai'; content: string }[]>([]);

  const handleClick = () => {
    if (isPro) {
      setVisible(true);
    } else {
      setPromoVisible(true);
    }
  };

  const handleSend = async () => {
    if (!question.trim()) return;
    const q = question;
    setQuestion('');
    setChat(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    let hotelId = 0;
    const token = localStorage.getItem('hotel_admin_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        hotelId = payload.hotelId;
      } catch (e) {}
    }

    try {
      const res = await api.post('/ai/chat', { message: q, hotelId });
      setChat(prev => [...prev, { role: 'ai', content: res.data.data.answer || res.data.data.content }]);
    } catch (e: any) {
      setChat(prev => [...prev, { role: 'ai', content: '抱歉，我目前无法连接到 AI 助手。' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatButton
        type="primary"
        icon={<RobotOutlined />}
        onClick={handleClick}
        style={{ right: 30, bottom: 100 }}
        tooltip={<div>AI 经营助手</div>}
      />

      <Modal
        title="升级 Pro 解锁 AI 经营助手"
        open={promoVisible}
        onCancel={() => setPromoVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPromoVisible(false)}>再想想</Button>,
          <Button key="upgrade" type="primary" onClick={() => { setPromoVisible(false); window.location.hash = '#/subscription'; }}>立即升级</Button>
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <RobotOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
          <p>AI 经营助手是 Pro 会员专属功能，可以为您提供：</p>
          <ul style={{ textAlign: 'left', display: 'inline-block' }}>
            <li>智能经营数据分析</li>
            <li>客情自动回复建议</li>
            <li>个性化营销方案策划</li>
          </ul>
        </div>
      </Modal>

      <Drawer
        title="AI 经营助手 (Pro 专属)"
        placement="right"
        width={400}
        onClose={() => setVisible(false)}
        open={visible}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <Input
              placeholder="输入您想咨询的问题..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onPressEnter={handleSend}
              disabled={loading}
            />
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} />
          </div>
        }
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
            <List
              dataSource={chat}
              renderItem={item => (
                <List.Item style={{ border: 'none', padding: '8px 0' }}>
                  <List.Item.Meta
                    avatar={<Avatar icon={item.role === 'user' ? null : <RobotOutlined />} style={{ backgroundColor: item.role === 'user' ? '#1890ff' : '#52c41a' }}>{item.role === 'user' ? '我' : ''}</Avatar>}
                    title={item.role === 'user' ? '我的提问' : '智能回复'}
                    description={<div style={{ color: '#333', whiteSpace: 'pre-wrap' }}>{item.content}</div>}
                  />
                </List.Item>
              )}
            />
            {loading && <div style={{ textAlign: 'center', margin: '20px 0' }}><Spin tip="思考中..." /></div>}
          </div>
        </div>
      </Drawer>
    </>
  );
}