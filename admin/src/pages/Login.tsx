import { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../api';
import { usePlan } from '../store/planContext';

export default function Login() {
  const token = localStorage.getItem('hotel_admin_token');
  if (token) return <Navigate to="/" replace />;

  return <LoginForm />;
}

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loadPlan } = usePlan();

  const onLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/hotel-admin-login', values);
      localStorage.setItem('hotel_admin_token', res.data.token);
      await loadPlan();
      navigate('/');
    } catch {
      message.error('手机号或密码错误');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values: {
    name: string;
    phone: string;
    password: string;
    hotelName: string;
    hotelAddress: string;
    hotelCity?: string;
    hotelPhone?: string;
  }) => {
    setLoading(true);
    try {
      await api.post('/auth/register-hotel-admin', {
        name: values.name,
        phone: values.phone,
        password: values.password,
        hotelName: values.hotelName,
        hotelAddress: values.hotelAddress,
        hotelCity: values.hotelCity,
        hotelPhone: values.hotelPhone,
      });
      message.success('注册成功！请等待系统管理员审核后再登录。');
    } catch (e: any) {
      message.error(e?.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = { width: 420 };
  const wrapStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f2f5',
  };

  return (
    <div style={wrapStyle}>
      <Card style={cardStyle}>
        <Tabs
          defaultActiveKey="login"
          items={[
            {
              key: 'login',
              label: '登录',
              children: (
                <Form onFinish={onLogin} layout="vertical">
                  <Form.Item label="手机号" name="username" rules={[{ required: true }]}>
                    <Input placeholder="请输入手机号" />
                  </Form.Item>
                  <Form.Item label="密码" name="password" rules={[{ required: true }]}>
                    <Input.Password placeholder="请输入密码" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    登录
                  </Button>
                </Form>
              ),
            },
            {
              key: 'register',
              label: '注册',
              children: (
                <Form onFinish={onRegister} layout="vertical">
                  <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
                    <Input placeholder="请输入姓名" />
                  </Form.Item>
                  <Form.Item
                    label="手机号"
                    name="phone"
                    rules={[{ required: true }, { pattern: /^1[3-9]\d{9}$/, message: '请输入有效手机号' }]}
                  >
                    <Input placeholder="请输入手机号" />
                  </Form.Item>
                  <Form.Item
                    label="密码"
                    name="password"
                    rules={[{ required: true }, { min: 6, message: '密码至少6位' }]}
                  >
                    <Input.Password placeholder="请输入密码（至少6位）" />
                  </Form.Item>
                  <Form.Item label="酒店名称" name="hotelName" rules={[{ required: true }]}>
                    <Input placeholder="请输入酒店名称" />
                  </Form.Item>
                  <Form.Item label="酒店地址" name="hotelAddress" rules={[{ required: true }]}>
                    <Input placeholder="请输入酒店详细地址" />
                  </Form.Item>
                  <Form.Item label="城市" name="hotelCity">
                    <Input placeholder="如：北京" />
                  </Form.Item>
                  <Form.Item label="酒店联系电话" name="hotelPhone">
                    <Input placeholder="如：010-12345678" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    提交注册申请
                  </Button>
                  <div style={{ marginTop: 12, color: '#888', fontSize: 12 }}>
                    注册后需等待系统管理员审核，审核通过后方可登录。
                  </div>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
