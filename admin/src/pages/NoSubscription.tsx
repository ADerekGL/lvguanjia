import { Button, Result } from 'antd';

export default function NoSubscription() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Result
        status="403"
        title="未开通订阅"
        subTitle="您的酒店尚未开通服务套餐，请联系系统管理员开通。"
        extra={
          <Button
            onClick={() => {
              localStorage.removeItem('hotel_admin_token');
              window.location.href = '/login';
            }}
          >
            返回登录
          </Button>
        }
      />
    </div>
  );
}
