import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://civic-reporter-android-app.onrender.com/api';

const authorityApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

authorityApi.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('authorityToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Failed to retrieve authority token:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authorityLogin = async (email, password) => {
  return await authorityApi.post('/authority/login', { email, password });
};

export const getAuthorityComplaints = async (status = '', authorityType = '') => {
  const params = [];
  if (status) params.push(`status=${encodeURIComponent(status)}`);
  if (authorityType) params.push(`authorityType=${encodeURIComponent(authorityType)}`);
  const queryString = params.join('&');
  const url = queryString ? `/authority/complaints?${queryString}` : '/authority/complaints';
  return await authorityApi.get(url);
};

export const getAuthorityStats = async () => {
  return await authorityApi.get('/authority/dashboard/stats');
};

export const updateComplaintStatus = async (id, status) => {
  return await authorityApi.patch(`/authority/complaints/${id}/status`, { status });
};

export const registerAuthority = async (data) => {
  return await authorityApi.post('/authority/register', data);
};

export default authorityApi;
