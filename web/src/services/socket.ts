import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io('/chat', {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => console.log('Socket connected'));
  socket.on('disconnect', () => console.log('Socket disconnected'));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}

// Notification listeners
type NotificationHandler = (payload: any) => void;
const handlers: NotificationHandler[] = [];

export function onServiceUpdate(handler: NotificationHandler): () => void {
  handlers.push(handler);
  const sock = getSocket();
  if (sock) sock.on('service_update', handler);
  return () => {
    const idx = handlers.indexOf(handler);
    if (idx !== -1) handlers.splice(idx, 1);
    const s = getSocket();
    if (s) s.off('service_update', handler);
  };
}

// Re-attach listeners after reconnect
export function attachNotificationListeners(sock: Socket): void {
  for (const h of handlers) {
    sock.off('service_update', h);
    sock.on('service_update', h);
  }
}
