import React, { useState, useEffect } from 'react';
import {
  NavBar,
  Card,
  Tag,
  Button,
  TextArea,
  Selector,
  Toast,
  Tabs,
} from 'antd-mobile';
import dayjs from 'dayjs';
import { serviceApi } from '../services/api';
import { useAuthStore } from '../store/auth';

interface ServiceType {
  id: number;
  name: string;
  icon?: string;
}

interface ServiceRequest {
  id: number;
  description: string;
  status: number; // 1-待处理 2-处理中 3-已完成 4-已取消
  createdAt: string;
  type?: ServiceType;
}

const statusColor: Record<number, 'default' | 'warning' | 'primary' | 'success' | 'danger'> = {
  1: 'warning',
  2: 'primary',
  3: 'success',
  4: 'danger',
};

const statusText: Record<number, string> = {
  1: '待处理',
  2: '处理中',
  3: '已完成',
  4: '已取消',
};

const Service: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('request');
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedType, setSelectedType] = useState<number[]>([]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.hotelId) return;
    serviceApi.types().then((res: any) => {
      setServiceTypes(res.data || res || []);
    }).catch(() => {});
  }, [user?.hotelId]);

  const fetchRequests = () => {
    if (!user?.roomId) return;
    serviceApi.list().then((res: any) => {
      setRequests(res.data || res || []);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.roomId]);

  const handleSubmit = async () => {
    if (selectedType.length === 0) {
      Toast.show({ content: '请选择服务类型', position: 'top' });
      return;
    }
    if (!user?.hotelId || !user?.roomId) {
      Toast.show({ content: '请先登录并分配房间', position: 'top' });
      return;
    }
    setSubmitting(true);
    try {
      await serviceApi.create({
        typeId: selectedType[0],
        description: description || '无备注',
      });
      setSelectedType([]);
      setDescription('');
      Toast.show({ content: '服务请求已提交', icon: 'success' });
      fetchRequests();
      setActiveTab('history');
    } catch (e: any) {
      Toast.show({ content: e.message || '提交失败', icon: 'fail' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (req: ServiceRequest) => {
    try {
      await serviceApi.updateStatus(req.id, 4);
      Toast.show({ content: '已取消', icon: 'success' });
      fetchRequests();
    } catch (e: any) {
      Toast.show({ content: e.message || '操作失败', icon: 'fail' });
    }
  };

  const selectorOptions = serviceTypes.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <NavBar back={null}>客房服务</NavBar>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.Tab title="发起服务" key="request" />
        <Tabs.Tab title="服务记录" key="history" />
      </Tabs>

      <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
        {activeTab === 'request' ? (
          <>
            <Card title="选择服务类型" style={{ marginBottom: '12px' }}>
              <Selector
                options={selectorOptions}
                value={selectedType}
                onChange={(v) => setSelectedType(v as number[])}
              />
            </Card>

            <Card title="备注说明" style={{ marginBottom: '12px' }}>
              <TextArea
                placeholder="请描述您的需求（选填）"
                value={description}
                onChange={setDescription}
                rows={3}
                maxLength={200}
                showCount
              />
            </Card>

            <Button
              block
              color="primary"
              size="large"
              loading={submitting}
              onClick={handleSubmit}
            >
              提交服务请求
            </Button>
          </>
        ) : (
          requests.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>暂无服务记录</div>
          ) : (
            requests.map((req) => (
              <Card key={req.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 'bold' }}>{req.type?.name || '服务请求'}</span>
                  <Tag color={statusColor[req.status] || 'default'}>
                    {statusText[req.status] || String(req.status)}
                  </Tag>
                </div>
                {req.description && req.description !== '无备注' && (
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '6px' }}>备注：{req.description}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#999' }}>
                    {dayjs(req.createdAt).format('MM-DD HH:mm')}
                  </span>
                  {req.status === 1 && (
                    <Button size="mini" fill="outline" onClick={() => handleCancel(req)}>取消</Button>
                  )}
                </div>
              </Card>
            ))
          )
        )}
      </div>
    </div>
  );
};

export default Service;
