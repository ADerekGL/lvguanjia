import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});

export const adminApi = {
  stats: () => api.get('/admin/stats'),

  hotels: () => api.get('/admin/hotels'),
  createHotel: (data: object) => api.post('/admin/hotels', data),
  updateHotel: (id: number, data: object) => api.put(`/admin/hotels/${id}`, data),

  users: (params?: { page?: number; limit?: number; hotelId?: number; role?: number }) =>
    api.get('/admin/users', { params }),
  updateUser: (id: number, data: { role?: number; status?: number }) =>
    api.put(`/admin/users/${id}`, data),

  orders: (params?: { page?: number; limit?: number; hotelId?: number; status?: number }) =>
    api.get('/admin/orders', { params }),
  updateOrderStatus: (id: number, status: number) =>
    api.put(`/admin/orders/${id}/status`, { status }),

  services: (params?: { hotelId?: number; status?: number }) =>
    api.get('/admin/services', { params }),
  updateServiceStatus: (id: number, status: number) =>
    api.put(`/admin/services/${id}/status`, { status }),

  rooms: (params?: { hotelId?: number }) =>
    api.get('/admin/rooms', { params }),
  updateRoomStatus: (id: number, status: number) =>
    api.put(`/admin/rooms/${id}/status`, { status }),

  checkins: (params?: { hotelId?: number }) =>
    api.get('/admin/checkins', { params }),
  checkIn: (data: { hotelId: number; roomNumber: string; name: string; phone: string }) =>
    api.post('/admin/checkin', data),
  checkOut: (userId: number) =>
    api.delete(`/admin/checkin/${userId}`),
};

export default api;
