import React, { useState } from 'react';
import { NavBar, Rate, TextArea, Button, Space, Toast, Result } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const Rating: React.FC = () => {
  const navigate = useNavigate();
  const { clearAuth } = useAuthStore();
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    // TODO: 调用 POST /service-requests/rating 接口
    // try {
    //   await api.post('/service-requests/rating', { score, comment });
    // } catch (e) {}

    Toast.show({
      icon: 'success',
      content: '感谢您的评价',
    });
    setSubmitted(true);

    setTimeout(() => {
      clearAuth();
      navigate('/login');
    }, 2000);
  };

  const handleSkip = () => {
    clearAuth();
    navigate('/login');
  };

  if (submitted) {
    return (
      <div style={{ padding: '40px 20px' }}>
        <Result
          status='success'
          title='评价提交成功'
          description='正在为您跳转至登录页...'
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar back={null}>离店评价</NavBar>
      <div style={{ padding: '20px', textAlign: 'center', background: '#fff' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
          您的评价对我们很重要
        </div>
        <Rate
          allowHalf
          value={score}
          onChange={setScore}
          style={{ '--star-size': '40px', marginBottom: '30px' }}
        />

        <TextArea
          placeholder='说说您的入住感受吧 (选填)'
          value={comment}
          onChange={setComment}
          rows={4}
          style={{
            '--font-size': '16px',
            background: '#f9f9f9',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '30px',
          }}
        />

        <Space direction='vertical' block>
          <Button block color='primary' size='large' onClick={handleSubmit}>
            提交评价
          </Button>
          <Button block fill='none' color='default' onClick={handleSkip}>
            跳过
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default Rating;