import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { authApi } from '../services/api';

// This page handles the redirect from GET /api/auth/wechat-callback
// URL: /auth-callback?token=<jwt>
const WechatCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    // Store token first so the profile request is authenticated
    setAuth(null, token);
    authApi.profile()
      .then((res: any) => {
        const user = res?.user || res?.data?.user || res;
        setAuth(user, token);
        navigate('/', { replace: true });
      })
      .catch(() => navigate('/login', { replace: true }));
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#1677ff', fontSize: '16px' }}>登录中...</div>
    </div>
  );
};

export default WechatCallback;
