import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hotel_admin_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hotel_admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const roomApi = {
  list: () => api.get('/hotel-admin/rooms'),
  updateStatus: (id: number, status: number) => api.put(`/hotel-admin/rooms/${id}/status`, { status }),
};

export const userApi = {
  list: (page = 1, limit = 20) => api.get(`/hotel-admin/users?page=${page}&limit=${limit}`),
  update: (id: number, data: object) => api.put(`/hotel-admin/users/${id}`, data),
};

export const orderApi = {
  list: (page = 1, limit = 20) => api.get(`/hotel-admin/orders?page=${page}&limit=${limit}`),
  updateStatus: (id: number, status: number) => api.put(`/hotel-admin/orders/${id}/status`, { status }),
};

export const serviceApi = {
  list: (page = 1, limit = 20) => api.get(`/hotel-admin/services?page=${page}&limit=${limit}`),
  updateStatus: (id: number, status: number) => api.put(`/hotel-admin/services/${id}/status`, { status }),
};

export const productApi = {
  list: () => api.get('/hotel-admin/products'),
  create: (data: object) => api.post('/hotel-admin/products', data),
  update: (id: number, data: object) => api.put(`/hotel-admin/products/${id}`, data),
  delete: (id: number) => api.delete(`/hotel-admin/products/${id}`),
};

export const checkinApi = {
  list: () => api.get('/hotel-admin/checkins'),
  create: (data: object) => api.post('/hotel-admin/checkin', data),
  remove: (userId: number) => api.delete(`/hotel-admin/checkin/${userId}`),
};

export const statsApi = {
  get: () => api.get('/hotel-admin/stats'),
};

export const subscriptionApi = {
  getCurrent: () => api.get('/hotel-admin/subscription'),
  getPlans: () => api.get('/hotel-admin/subscription/plans'),
  upgrade: (planId: number, billingCycle: 'monthly' | 'annual' = 'monthly', paymentMethod: 'alipay' | 'wechat' = 'alipay') =>
    api.post('/hotel-admin/subscription/upgrade', { planId, billingCycle, paymentMethod }),
  getOrders: () => api.get('/hotel-admin/subscription/orders'),
};

export default api;
