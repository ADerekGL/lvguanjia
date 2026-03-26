import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
});

const HOTEL_ID = 1;

export const roomApi = {
  list: () => api.get(`/rooms/hotel/${HOTEL_ID}`),
  create: (data: object) => api.post('/rooms', { ...data, hotelId: HOTEL_ID }),
  update: (id: number, data: object) => api.put(`/rooms/${id}`, data),
  updateStatus: (id: number, status: number) => api.put(`/rooms/${id}/status`, { status }),
};

export const userApi = {
  list: (page = 1, limit = 20) =>
    api.get(`/users/hotel/${HOTEL_ID}?page=${page}&limit=${limit}`),
  assignRoom: (userId: number, roomId: number) =>
    api.put(`/users/${userId}/assign-room`, { roomId }),
};

export const orderApi = {
  list: (page = 1, limit = 20) =>
    api.get(`/orders/all?hotelId=${HOTEL_ID}&page=${page}&limit=${limit}`),
  updateStatus: (id: number, status: number) =>
    api.put(`/orders/admin/${id}/status`, { status }),
};

export const serviceApi = {
  list: () => api.get(`/services/all?hotelId=${HOTEL_ID}`),
  updateStatus: (id: number, status: number) =>
    api.put(`/services/${id}/status`, { status }),
};

export const productApi = {
  list: () => api.get(`/products/admin/all?hotelId=${HOTEL_ID}`),
  create: (data: object) => api.post('/products', { ...data, hotelId: HOTEL_ID }),
  update: (id: number, data: object) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export default api;
