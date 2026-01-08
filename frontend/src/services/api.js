// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const register = (email, password, role) => api.post('/api/auth/register', { email, password, role });
export const getCurrentUser = () => api.get('/api/auth/me');

// Campaigns
export const getCampaigns = () => api.get('/api/campaigns');
export const getCampaign = (id) => api.get(`/api/campaigns/${id}`);
export const createCampaign = (data) => api.post('/api/campaigns', data);
export const launchCampaign = (id) => api.post(`/api/campaigns/${id}/launch`);
export const deleteCampaign = (id) => api.delete(`/api/campaigns/${id}`);

// Analytics
export const getCampaignStats = (id) => api.get(`/api/analytics/campaign/${id}`);

// Report phishing
export const reportPhishing = (token) => api.post(`/report/${token}`);

export default api;