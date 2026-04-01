import React, { useState, useEffect } from 'react';
import {
  NavBar,
  List,
  Avatar,
  Button,
  Form,
  Input,
  Dialog,
  Toast,
  Space,
} from 'antd-mobile';
import {
  UserOutline,
  PhonebookOutline,
  EnvironmentOutline,
  ExclamationCircleOutline,
} from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { userApi, authApi } from '../services/api';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setAuth, clearAuth, token } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: (user as any).phone || '', email: (user as any).email || '' });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res: any = await userApi.update(form);
      setAuth({ ...user!, ...(res.data || res) }, token!);
      setEditing(false);
      Toast.show({ content: '保存成功', icon: 'success' });
    } catch (e: any) {
      Toast.show({ content: e.message || '保存失败', icon: 'fail' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await Dialog.confirm({ content: '确认退出登录？' });
    if (!confirmed) return;
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    Toast.show({ content: '已退出登录' });
  };

  const displayName = user?.name || '未登录';
  const roomInfo = user?.roomId ? `房间 ${user.roomId}` : '未分配房间';
  const hotelInfo = user?.hotelId ? `酒店 #${user.hotelId}` : '';

  const [checkingOut, setCheckingOut] = useState(false);

  const handleSelfCheckout = async () => {
    const step1 = await Dialog.confirm({
      title: '申请退房',
      content: '请确认您已将房卡/房间钥匙归还前台，确认后将完成退房。',
      confirmText: '已还房卡，确认退房',
      cancelText: '取消',
    });
    if (!step1) return;
    const step2 = await Dialog.confirm({
      title: '再次确认',
      content: '退房后将无法再次使用该房间，确定退房吗？',
      confirmText: '确定退房',
      cancelText: '返回',
    });
    if (!step2) return;
    setCheckingOut(true);
    try {
      await authApi.selfCheckout();
      Dialog.show({
        title: '退房成功',
        content: (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ fontSize: '16px', marginBottom: '15px' }}>感谢您的入住！</div>
            <div style={{ color: '#666', marginBottom: '20px' }}>您可以为本次入住进行评分：</div>
            <Space direction='vertical' block>
              <Button block color='primary' size='large' onClick={() => { Dialog.clear(); navigate('/rating'); }}>
                立即去评价
              </Button>
              <Button block fill='none' color='default' onClick={() => { Dialog.clear(); clearAuth(); navigate('/login'); }}>
                暂不评价
              </Button>
            </Space>
          </div>
        ),
        closeOnAction: true,
        actions: [
          {
            key: 'confirm',
            text: '我知道了',
          },
        ],
      });
    } catch (e: any) {
      Toast.show({ content: e.message || '退房失败', icon: 'fail' });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <NavBar back={null} right={<Button size="small" fill="none" onClick={() => setEditing(true)}>编辑</Button>}>
        个人中心
      </NavBar>

      <div style={{ padding: '20px' }}>
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <Avatar src="" style={{ '--size': '80px', margin: '0 auto 16px' }} />
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{displayName}</div>
          <div style={{ color: '#666', fontSize: '14px' }}>{roomInfo} {hotelInfo}</div>
        </div>

        {!editing ? (
          <>
            <List style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
              <List.Item prefix={<UserOutline />} extra={user?.name || '未填写'}>姓名</List.Item>
              <List.Item prefix={<PhonebookOutline />} extra={(user as any)?.phone || '未填写'}>手机号</List.Item>
              <List.Item prefix={<EnvironmentOutline />} extra={user?.roomId || '未分配'}>房间号</List.Item>
            </List>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {user?.roomId && (
                <Button block color="danger" fill="outline" loading={checkingOut} onClick={handleSelfCheckout}>自助退房</Button>
              )}
              <Button block color="default" onClick={handleLogout}>退出登录</Button>
            </div>
          </>
        ) : (
          <>
            <List style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <List.Item prefix={<UserOutline />}>
                <Input
                  placeholder="请输入姓名"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
              </List.Item>
              <List.Item prefix={<PhonebookOutline />}>
                <Input
                  placeholder="请输入手机号"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
              </List.Item>
              <List.Item prefix={<ExclamationCircleOutline />}>
                <Input
                  placeholder="请输入邮箱"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                />
              </List.Item>
            </List>

            <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
              <Button block fill="outline" onClick={() => setEditing(false)}>取消</Button>
              <Button block color="primary" loading={saving} onClick={handleSave}>保存</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;