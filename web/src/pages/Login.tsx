import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Toast, NavBar } from 'antd-mobile';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import api from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth, setHotelId, hotelId: storedHotelId } = useAuthStore();
  const [roomNumber, setRoomNumber] = useState('');
  const [phoneLast4, setPhoneLast4] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWechat, setIsWechat] = useState(false);

  useEffect(() => {
    setIsWechat(/MicroMessenger/i.test(navigator.userAgent));
    const id = searchParams.get('hotelId');
    if (id) setHotelId(Number(id));
  }, []);

  const handleWechatOAuth = () => {
    const base = (window as any).__API_BASE__ || '';
    const hid = searchParams.get('hotelId') || storedHotelId;
    const qs = hid ? `?hotelId=${hid}` : '';
    window.location.href = `${base}/api/auth/wechat-oauth${qs}`;
  };

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
      const body: any = { roomNumber: roomNumber.trim(), phoneLast4: phoneLast4.trim() };
      const hid = searchParams.get('hotelId') ? Number(searchParams.get('hotelId')) : storedHotelId;
      if (hid) body.hotelId = hid;
      const res: any = await api.post('/auth/verify-checkin', body);
      const { user, token } = res;
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #1b4332 0%, #40916c 60%, #52b788 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px 24px', width: '100%', maxWidth: '360px', boxShadow: '0 8px 40px rgba(27,67,50,0.25)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px', lineHeight: 1 }}>🌿</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#2d6a4f', letterSpacing: '0.04em' }}>旅管家</div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>请使用房间号和手机号验证入住</div>
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
          style={{ marginTop: '16px', borderRadius: '8px', '--adm-color-primary': '#2d6a4f' } as any}
        >
          验证入住
        </Button>

        {isWechat && (
          <>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#bbb', margin: '16px 0 8px' }}>— 或 —</div>
            <Button
              block
              size="large"
              style={{ borderRadius: '8px', background: '#07c160', color: '#fff', border: 'none' }}
              onClick={handleWechatOAuth}
            >
              微信一键登录
            </Button>
          </>
        )}

        <div style={{ textAlign: 'center', fontSize: '12px', color: '#bbb', marginTop: '24px' }}>
          如无法登录，请联系前台工作人员
        </div>
      </div>
    </div>
  );
};

export default Login;
