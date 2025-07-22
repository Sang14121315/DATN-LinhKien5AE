import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Interceptors
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('🔍 Axios Interceptor - Token:', token);
  console.log('🔍 Axios Interceptor - URL:', config.url);
  console.log('🔍 Axios Interceptor - Method:', config.method);
  console.log('🔍 Axios Interceptor - Full URL:', (config.baseURL || '') + (config.url || ''));

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('✅ Axios Interceptor - Headers set:', config.headers);
  } else {
    console.log('❌ No token found in localStorage');
    console.log('❌ Available localStorage keys:', Object.keys(localStorage));
  }

  return config;
}, (error) => {
  console.error('❌ Request error:', error);
  return Promise.reject(error);
});

instance.interceptors.response.use((response) => {
  console.log('✅ Response:', response.status, response.config.url);
  return response;
}, (error) => {
  console.error('❌ Response error:', error.response?.status, error.response?.data);
  return Promise.reject(error);
});

export default instance; // ✅ Đặt cuối cùng
