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
} from 'antd-mobile';
import {
  UserOutline,
  PhonebookOutline,
  EnvironmentOutline,
  ExclamationCircleOutline,
} from 'antd-mobile-icons';
import { useAuthStore } from '../store/auth';
import { userApi, authApi } from '../services/api';

const Profile: React.FC = () => {
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
      Toast.show({ content: '退房成功，感谢您的入住！', icon: 'success' });
      clearAuth();
    } catch (e: any) {
      Toast.show({ content: e.message || '退房失败', icon: 'fail' });
    } finally {
      setCheckingOut(false);
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <NavBar back={null}>个人中心</NavBar>

      {/* Profile Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1677ff, #52c41a)',
          padding: '24px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <Avatar
          src={user?.avatar || ''}
          style={{ '--size': '60px', '--border-radius': '50%', flexShrink: 0 }}
          fallback={<UserOutline style={{ fontSize: '28px', color: '#fff' }} />}
        />
        <div style={{ color: '#fff' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{displayName}</div>
          <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px' }}>{roomInfo}{hotelInfo ? ` · ${hotelInfo}` : ''}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {!editing ? (
          <>
            <List header="基本信息">
              <List.Item prefix={<UserOutline />} extra={user?.name || '-'}>姓名</List.Item>
              <List.Item prefix={<PhonebookOutline />} extra={(user as any)?.phone || '-'}>手机号</List.Item>
              <List.Item prefix={<EnvironmentOutline />} extra={(user as any)?.email || '-'}>邮箱</List.Item>
            </List>

            <List header="入住信息">
              <List.Item extra={roomInfo}>房间</List.Item>
              <List.Item extra={hotelInfo || '-'}>酒店</List.Item>
            </List>

            <div style={{ padding: '16px' }}>
              <Button block color="primary" onClick={() => setEditing(true)} style={{ marginBottom: '12px' }}>
                编辑资料
              </Button>
              {user?.roomId && (
                <Button block color="warning" loading={checkingOut} onClick={handleSelfCheckout} style={{ marginBottom: '12px' }}>
                  申请退房
                </Button>
              )}
              <Button block color="danger" fill="outline" onClick={handleLogout}>
                退出登录
              </Button>
            </div>
          </>
        ) : (
          <>
            <List header="编辑资料">
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
