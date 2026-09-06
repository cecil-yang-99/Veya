import axios from 'axios';
import { message } from 'antd';
import { useAuthStore } from '../store/auth';

/**
 * Shared axios instance for the admin console. Attaches the JWT from the
 * auth store and redirects to the login page on 401 responses.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 30_000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      useAuthStore.getState().clearAuth();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    } else {
      // Surface a readable error toast for non-auth failures.
      const payload = error?.response?.data;
      const text = Array.isArray(payload?.message)
        ? payload.message.join(', ')
        : payload?.message ?? error.message ?? 'Request failed';
      message.error(text);
    }
    return Promise.reject(error);
  },
);
