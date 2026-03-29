import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export const adminApi = {
  login: (username: string, password: string) =>
    api.post('/auth/admin-login', { username, password }),

  stats: () => api.get('/sysadmin/stats'),

  hotels: () => api.get('/sysadmin/hotels'),
  createHotel: (data: object) => api.post('/sysadmin/hotels', data),
  updateHotel: (id: number, data: object) => api.put(`/sysadmin/hotels/${id}`, data),
  getHotelQrCode: (id: number) => api.get(`/sysadmin/hotels/${id}/qrcode`),
  initHotel: (id: number, floors: number, roomsPerFloor: number) =>
    api.post(`/sysadmin/hotels/${id}/init`, { floors, roomsPerFloor }),

  getHotelPrivilege: (hotelId: number) => api.get(`/sysadmin/hotels/${hotelId}/privilege`),
  setHotelPrivilege: (hotelId: number, data: { planName: string; reason: string; expiresAt?: string }) =>
    api.put(`/sysadmin/hotels/${hotelId}/privilege`, data),
  revokeHotelPrivilege: (hotelId: number) => api.post(`/sysadmin/hotels/${hotelId}/privilege/revoke`),

  users: (params?: { page?: number; limit?: number; hotelId?: number; role?: number }) =>
    api.get('/sysadmin/users', { params }),
  updateUser: (id: number, data: { role?: number; status?: number }) =>
    api.put(`/sysadmin/users/${id}`, data),

  getPendingHotelAdmins: () => api.get('/sysadmin/hotel-admins/pending'),
  approveHotelAdmin: (id: number) => api.put(`/sysadmin/hotel-admins/${id}/approve`),
  rejectHotelAdmin: (id: number) => api.put(`/sysadmin/hotel-admins/${id}/reject`),

  orders: (params?: { page?: number; limit?: number; hotelId?: number; status?: number }) =>
    api.get('/sysadmin/orders', { params }),
  updateOrderStatus: (id: number, status: number) =>
    api.put(`/sysadmin/orders/${id}/status`, { status }),

  services: (params?: { hotelId?: number; status?: number }) =>
    api.get('/sysadmin/services', { params }),
  updateServiceStatus: (id: number, status: number) =>
    api.put(`/sysadmin/services/${id}/status`, { status }),

  rooms: (params?: { hotelId?: number }) =>
    api.get('/sysadmin/rooms', { params }),
  updateRoomStatus: (id: number, status: number) =>
    api.put(`/sysadmin/rooms/${id}/status`, { status }),

  checkins: (params?: { hotelId?: number }) =>
    api.get('/sysadmin/checkins', { params }),
  checkIn: (data: { hotelId: number; roomNumber: string; name: string; phone: string }) =>
    api.post('/sysadmin/checkin', data),
  checkOut: (userId: number) =>
    api.delete(`/sysadmin/checkin/${userId}`),

  products: (params?: { hotelId?: number; category?: string }) =>
    api.get('/sysadmin/products', { params }),
  createProduct: (data: object) => api.post('/sysadmin/products', data),
  updateProduct: (id: number, data: object) => api.put(`/sysadmin/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/sysadmin/products/${id}`),

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },

  // --- Subscription ---
  listPlans: () => api.get('/sysadmin/plans'),
  createPlan: (data: object) => api.post('/sysadmin/plans', data),
  updatePlan: (id: number, data: object) => api.put(`/sysadmin/plans/${id}`, data),
  seedPlans: () => api.post('/sysadmin/plans/seed'),
  listSubscriptions: (page = 1, limit = 20) =>
    api.get(`/sysadmin/subscriptions?page=${page}&limit=${limit}`),
  getHotelSubscription: (hotelId: number) => api.get(`/sysadmin/subscriptions/${hotelId}`),
  grantSubscription: (hotelId: number, data: object) =>
    api.post(`/sysadmin/subscriptions/${hotelId}/grant`, data),
  cancelSubscription: (id: number) => api.put(`/sysadmin/subscriptions/${id}/cancel`),
};

export default api;
