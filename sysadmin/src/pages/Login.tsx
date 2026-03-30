import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const res = await adminApi.login(values.username, values.password);
      localStorage.setItem('admin_token', res.data.token);
      navigate('/');
    } catch (e: any) {
      message.error(e?.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #1b4332 0%, #40916c 60%, #52b788 100%)',
    }}>
      <Card title="旅管家 · 系统管理平台" style={{ width: 380, boxShadow: '0 8px 40px rgba(27,67,50,0.25)', borderRadius: 12 }}
        headStyle={{ textAlign: 'center', fontWeight: 700, fontSize: 17, color: '#2d6a4f' }}>
        <Form onFinish={onFinish} autoComplete="off">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ background: '#2d6a4f', borderColor: '#2d6a4f' }}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
