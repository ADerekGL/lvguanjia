import React, { useState } from 'react';
import { Button, Form, Input, Toast, NavBar } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { devAuthApi } from '../services/api';
import { useAuthStore } from '../store/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim() || !phone.trim()) {
      Toast.show({ content: '请填写姓名和手机号', icon: 'fail' });
      return;
    }
    setLoading(true);
    try {
      const res: any = await devAuthApi.login(name.trim(), phone.trim());
      const { user, token } = res.data || res;
      setAuth(user, token);
      navigate('/', { replace: true });
    } catch (e: any) {
      Toast.show({ content: e.message || '登录失败', icon: 'fail' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1677ff, #52c41a)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px 24px', width: '100%', maxWidth: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏨</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#1677ff' }}>智慧酒店管家</div>
          <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>入住更轻松，服务更贴心</div>
        </div>

        <Form layout="vertical">
          <Form.Item label="姓名">
            <Input
              placeholder="请输入您的姓名"
              value={name}
              onChange={setName}
              clearable
            />
          </Form.Item>
          <Form.Item label="手机号">
            <Input
              placeholder="请输入手机号"
              value={phone}
              onChange={setPhone}
              type="tel"
              clearable
            />
          </Form.Item>
        </Form>

        <Button
          color="primary"
          block
          size="large"
          loading={loading}
          onClick={handleLogin}
          style={{ marginTop: '16px', borderRadius: '8px' }}
        >
          进入酒店
        </Button>

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#bbb', marginTop: '24px' }}>
          登录即表示您同意服务条款与隐私政策
        </div>
      </div>
    </div>
  );
};

export default Login;
