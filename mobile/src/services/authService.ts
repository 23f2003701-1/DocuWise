import api from './api';
import { ApiResponse, AuthResponse, User, NotificationPreferences } from '../types';

export const authService = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      name,
      email,
      password,
    });
    return response.data.data!;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data.data!;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  updateProfile: async (data: { name?: string; email?: string }): Promise<User> => {
    const response = await api.put<ApiResponse<User>>('/auth/profile', data);
    return response.data.data!;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },

  updatePushToken: async (pushToken: string): Promise<void> => {
    await api.put('/auth/push-token', { pushToken });
  },

  updateNotificationPreferences: async (prefs: NotificationPreferences): Promise<NotificationPreferences> => {
    const response = await api.put<ApiResponse<NotificationPreferences>>(
      '/notifications/preferences',
      prefs
    );
    return response.data.data!;
  },
};
