import api from './api';

// Auth services
export const authService = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }
};

// User services
export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users/all');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/users/profile/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile/update', profileData);
    return response.data;
  }
};

// Swap request services
export const swapService = {
  sendRequest: async (receiverId, message) => {
    const response = await api.post('/swap/send', { receiverId, message });
    return response.data;
  },

  getReceivedRequests: async () => {
    const response = await api.get('/swap/received');
    return response.data;
  },

  getSentRequests: async () => {
    const response = await api.get('/swap/sent');
    return response.data;
  },

  updateRequestStatus: async (requestId, status) => {
    const response = await api.put(`/swap/${requestId}`, { status });
    return response.data;
  },

  cancelRequest: async (requestId) => {
    const response = await api.delete(`/swap/${requestId}`);
    return response.data;
  }
};
