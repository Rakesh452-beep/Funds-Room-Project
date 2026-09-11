import axios from 'axios';
import type { ApiResponse } from '../types';

// Relative /api works everywhere:
//  - dev server: vite proxies /api -> localhost:5000
//  - single-host deploy: same backend serves UI + API
//  - Vercel + Render: vercel.json rewrites /api to the Render backend
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const getToken = () => localStorage.getItem('fundsroom_token');

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRoute = error.config?.url?.includes('/auth/login');
      if (!isLoginRoute) {
        localStorage.removeItem('fundsroom_token');
        localStorage.removeItem('fundsroom_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error: any, fallback: string): string => {
  const response = error?.response?.data as ApiResponse | undefined;
  return response?.message || fallback;
};

export default api;