import { apiClient } from './apiClient';
import type { ChangePasswordPayload, LoginRequest, LoginResponse, MeResponse } from './types';

export const authApi = {
  login: async (payload: LoginRequest) => {
    const { data } = await apiClient.post<LoginResponse>('/v1/auth/login', payload);
    return data;
  },
  me: async () => {
    const { data } = await apiClient.get<MeResponse>('/v1/auth/me');
    return data;
  },
  logout: async (refreshToken: string | null) => {
    if (!refreshToken) return;
    await apiClient.post('/v1/auth/logout', { refreshToken });
  },
  changePassword: async (payload: ChangePasswordPayload) => {
    await apiClient.put('/v1/auth/password', payload);
  },
};
