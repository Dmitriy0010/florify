import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
    // DEBUG: See what we are sending
    if (config.url?.includes('inventory')) {
      console.log(`📡 SENDING TOKEN TO INVENTORY (last 5 chars): ...${token.slice(-5)}`);
    }
  }
  return config;
});

// Interceptor to handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');
        
        const res = await axios.post('/api/v1/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken, user } = res.data;
        
        // Also update refresh token and user info if backend returns them
        if (newRefreshToken && user) {
            useAuthStore.getState().setAuth(accessToken, newRefreshToken, user);
        } else {
            useAuthStore.getState().setAccessToken(accessToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (e) {
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);
