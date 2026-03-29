import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap data
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || '请求失败';
    return Promise.reject(new Error(message));
  },
);

export default api;

// --- Auth ---
export const authApi = {
  wechatLogin: (code: string, userInfo?: object) =>
    api.post('/auth/wechat-login', { code, userInfo }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get('/auth/profile'),
  selfCheckout: () => api.post('/auth/self-checkout'),
};

// --- User ---
export const userApi = {
  update: (data: object) => api.put('/users/profile', data),
  getById: (id: number) => api.get(`/users/${id}`),
};

// --- Room ---
export const roomApi = {
  listByHotel: (hotelId: number) => api.get(`/rooms/hotel/${hotelId}`),
  getById: (id: number) => api.get(`/rooms/${id}`),
  assignRoom: (userId: number, roomId: number) =>
    api.put(`/users/${userId}/assign-room`, { roomId }),
};

// --- Message ---
export const messageApi = {
  history: (limit = 50) => api.get(`/messages/room?limit=${limit}`),
  unreadCount: () => api.get('/messages/unread'),
};

// --- Product ---
export const productApi = {
  list: (category?: string) =>
    api.get(`/products${category ? `?category=${category}` : ''}`),
  getById: (id: number) => api.get(`/products/${id}`),
};

// --- Order ---
export const orderApi = {
  create: (data: { items: { productId: number; quantity: number }[]; remark?: string }) =>
    api.post('/orders', data),
  list: (page = 1, limit = 10) =>
    api.get(`/orders?page=${page}&limit=${limit}`),
  getById: (id: number) => api.get(`/orders/${id}`),
  cancel: (id: number) => api.put(`/orders/${id}/cancel`),
};

// --- Service ---
export const serviceApi = {
  types: () => api.get('/services/types'),
  create: (data: { typeId: number; description: string }) => api.post('/services/request', data),
  list: () => api.get('/services/my'),
  updateStatus: (id: number, status: number) => api.put(`/services/${id}/status`, { status }),
};

// --- Payment ---
export const paymentApi = {
  pay: (orderId: number, channel: number) =>
    api.post('/payment/pay', { orderId, channel }),
  receipt: (orderId: number) =>
    api.get(`/payment/receipt/${orderId}`),
};

// --- AI ---
export const aiApi = {
  ask: (question: string) =>
    api.post('/ai/ask', { question }),
  recommend: (category?: string) =>
    api.post('/ai/recommendations', { category }),
};

// --- Auth Dev ---
export const devAuthApi = {
  login: (name: string, phone: string) =>
    api.post('/auth/dev-login', { name, phone }),
};
