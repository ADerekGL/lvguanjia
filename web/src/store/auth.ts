import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  avatar?: string;
  phone?: string;
  role: number;
  roomId?: number;
  hotelId?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hotelId: number | null;
  setAuth: (user: User | null, token: string) => void;
  clearAuth: () => void;
  setHotelId: (id: number) => void;
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadHotelId(): number | null {
  const raw = localStorage.getItem('hotelId');
  return raw ? Number(raw) : null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadUser(),
  token: localStorage.getItem('token'),
  hotelId: loadHotelId(),
  setAuth: (user: User | null, token: string) => {
    localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('hotelId');
    set({ user: null, token: null, hotelId: null });
  },
  setHotelId: (id: number) => {
    localStorage.setItem('hotelId', String(id));
    set({ hotelId: id });
  },
}));
