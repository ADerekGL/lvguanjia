import React, { useState } from 'react';
import { Button, Form, Input, Toast, NavBar } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3000/api' });

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [roomNumber, setRoomNumber] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!roomNumber.trim()) {
      Toast.show({ content: '请输入房间号', icon: 'fail' });
      return;
    }
    if (phoneLast4.length !== 4 || !/^\d{4}$/.test(phoneLast4)) {
      Toast.show({ content: '请输入手机号后4位', icon: 'fail' });
      return;
    }
    setLoading(true);
    try {
      const res: any = await api.post('/auth/verify-checkin', {
        roomNumber: roomNumber.trim(),
        phoneLast4: phoneLast4.trim(),
      });
      const { user, token } = res.data;
      setAuth(user, token);
      navigate('/', { replace: true });
    } catch (e: any) {
      const msg = e.response?.data?.message || e.message || '验证失败';
      Toast.show({ content: msg, icon: 'fail' });
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
          <div style={{ fontSize: '13px', color: '#999', marginTop: '4px' }}>请使用房间号和手机号验证入住</div>
        </div>

        <Form layout="vertical">
          <Form.Item label="房间号">
            <Input
              placeholder="请输入您的房间号（如 101）"
              value={roomNumber}
              onChange={setRoomNumber}
              clearable
            />
          </Form.Item>
          <Form.Item label="手机号后4位">
            <Input
              placeholder="请输入预留手机号后4位"
              value={phoneLast4}
              onChange={setPhoneLast4}
              type="tel"
              maxLength={4}
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
          验证入住
        </Button>

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#bbb', marginTop: '24px' }}>
          如无法登录，请联系前台工作人员
        </div>
      </div>
    </div>
  );
};

export default Login;
