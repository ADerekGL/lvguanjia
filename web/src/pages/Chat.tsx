import React, { useState, useEffect, useRef } from 'react';
import {
  NavBar,
  Input,
  Button,
  Toast,
  Tabs,
  Tag,
} from 'antd-mobile';
import {
  SendOutline,
  SmileOutline,
} from 'antd-mobile-icons';
import dayjs from 'dayjs';
import { messageApi, aiApi } from '../services/api';
import { connectSocket, getSocket } from '../services/socket';
import { useAuthStore } from '../store/auth';

interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  type: number;
  createdAt: string;
  isMine?: boolean;
}

interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  cached?: boolean;
}

const Chat: React.FC = () => {
  const { user, token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('chat');

  // Socket chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI chat state
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    { role: 'assistant', content: '您好！我是智慧酒店AI管家，有什么可以帮助您的？' },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollAiToBottom = () => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { scrollAiToBottom(); }, [aiMessages]);

  // Load message history
  useEffect(() => {
    if (!user?.roomId) return;
    messageApi.history().then((res: any) => {
      const data: Message[] = (Array.isArray(res) ? res : res.data || []).map((m: any) => ({
        ...m,
        isMine: m.senderId === user.id,
      }));
      setMessages(data);
    }).catch(() => {});
  }, [user?.roomId]);

  // Connect socket
  useEffect(() => {
    if (!token || !user?.roomId) return;
    const sock = connectSocket(token);
    sock.emit('join_room', { roomId: user.roomId });
    sock.on('receive_message', (msg: any) => {
      setMessages((prev) => [
        ...prev,
        { ...msg, isMine: msg.senderId === user.id },
      ]);
    });
    return () => { sock.off('receive_message'); };
  }, [token, user?.roomId]);

  const handleSend = async () => {
    if (!inputValue.trim() || !user?.roomId) return;
    const content = inputValue.trim();
    setInputValue('');
    setLoading(true);
    const sock = getSocket();
    if (sock?.connected) {
      sock.emit('send_message', { roomId: user.roomId, content, type: 1 });
      // Optimistically add own message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          senderId: user.id,
          senderName: user.name,
          content,
          type: 1,
          createdAt: new Date().toISOString(),
          isMine: true,
        },
      ]);
    } else {
      Toast.show({ content: '连接已断开，请刷新重试', position: 'top' });
    }
    setLoading(false);
  };

  const handleAiSend = async () => {
    if (!aiInput.trim()) return;
    const question = aiInput.trim();
    setAiInput('');
    setAiMessages((prev) => [...prev, { role: 'user', content: question }]);
    setAiLoading(true);
    try {
      const res: any = await aiApi.ask(question);
      const data = res.data || res;
      setAiMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, cached: data.cached },
      ]);
    } catch (e: any) {
      setAiMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，暂时无法回答，请稍后再试。' },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const quickOptions = ['早餐时间', 'WiFi密码', '退房时间', '叫醒服务', '洗衣服务'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <NavBar back={null}>在线客服</NavBar>

      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ flexShrink: 0 }}>
        <Tabs.Tab title="人工客服" key="chat" />
        <Tabs.Tab title="AI管家" key="ai" />
      </Tabs>

      {activeTab === 'chat' ? (
        <>
          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '12px', background: '#f5f5f5' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: '32px 0', fontSize: '14px' }}>
                暂无消息，发送第一条消息吧
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                style={{
                  display: 'flex',
                  flexDirection: msg.isMine ? 'row-reverse' : 'row',
                  marginBottom: '12px',
                  alignItems: 'flex-end',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: msg.isMine ? '#1677ff' : '#52c41a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  {(msg.senderName || '?')[0]}
                </div>
                <div style={{ maxWidth: '70%' }}>
                  {!msg.isMine && (
                    <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                      {msg.senderName}
                    </div>
                  )}
                  <div
                    style={{
                      background: msg.isMine ? '#1677ff' : '#fff',
                      color: msg.isMine ? '#fff' : '#333',
                      padding: '10px 14px',
                      borderRadius: msg.isMine ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                      fontSize: '15px',
                      lineHeight: '1.5',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}
                  >
                    {msg.content}
                  </div>
                  <div style={{ fontSize: '11px', color: '#bbb', marginTop: '4px', textAlign: msg.isMine ? 'right' : 'left' }}>
                    {dayjs(msg.createdAt).format('HH:mm')}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick options */}
          <div style={{ padding: '8px 12px', background: '#fff', display: 'flex', gap: '6px', overflowX: 'auto', flexShrink: 0 }}>
            {quickOptions.map((opt) => (
              <Button
                key={opt}
                size="mini"
                fill="outline"
                style={{ flexShrink: 0 }}
                onClick={() => setInputValue(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Button shape="rounded" fill="none" style={{ flexShrink: 0 }} onClick={() => { Toast.show('表情功能开发中'); }}>
              <SmileOutline style={{ fontSize: 20 }} />
            </Button>
            <Input
              placeholder="请输入消息..."
              value={inputValue}
              onChange={setInputValue}
              onEnterPress={handleSend}
              style={{ '--border-radius': '20px', '--padding-left': '12px' } as React.CSSProperties}
            />
            <Button color="primary" shape="rounded" style={{ flexShrink: 0 }} loading={loading} onClick={handleSend}>
              <SendOutline style={{ fontSize: 20 }} />
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* AI Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '12px', background: '#f5f5f5' }}>
            {aiMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  marginBottom: '16px',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: msg.role === 'user' ? '#1677ff' : '#722ed1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  {msg.role === 'user' ? (user?.name?.[0] || '我') : 'AI'}
                </div>
                <div style={{ maxWidth: '75%' }}>
                  <div
                    style={{
                      background: msg.role === 'user' ? '#1677ff' : '#fff',
                      color: msg.role === 'user' ? '#fff' : '#333',
                      padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.content}
                  </div>
                  {msg.cached && (
                    <Tag color="default" style={{ marginTop: 4, fontSize: 11 }}>缓存</Tag>
                  )}
                </div>
              </div>
            ))}
            {aiLoading && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#722ed1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', flexShrink: 0 }}>AI</div>
                <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '4px 18px 18px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', color: '#999' }}>正在思考中...</div>
              </div>
            )}
            <div ref={aiEndRef} />
          </div>

          {/* Quick AI questions */}
          <div style={{ padding: '8px 12px', background: '#fff', display: 'flex', gap: '6px', overflowX: 'auto', flexShrink: 0 }}>
            {quickOptions.map((opt) => (
              <Button
                key={opt}
                size="mini"
                fill="outline"
                style={{ flexShrink: 0 }}
                onClick={() => setAiInput(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>

          {/* AI Input */}
          <div style={{ padding: '12px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Input
              placeholder="问问AI管家..."
              value={aiInput}
              onChange={setAiInput}
              onEnterPress={handleAiSend}
              style={{ '--border-radius': '20px', '--padding-left': '12px' } as React.CSSProperties}
            />
            <Button color="primary" shape="rounded" style={{ flexShrink: 0 }} loading={aiLoading} onClick={handleAiSend}>
              <SendOutline style={{ fontSize: 20 }} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
