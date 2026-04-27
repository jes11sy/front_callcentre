import api from '@/lib/api';

export const profileService = {
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data.data || response.data;
  },

  async getProfileStats() {
    const response = await api.get('/auth/profile/stats');
    return response.data.data || response.data;
  },

  async updateProfile(data: Record<string, unknown>) {
    const response = await api.put('/auth/profile', data);
    return response.data.data || response.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await api.put('/auth/profile', {
      currentPassword,
      newPassword,
    });
    return response.data.data || response.data;
  },
};

