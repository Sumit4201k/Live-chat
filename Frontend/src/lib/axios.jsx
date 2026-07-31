import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL 
    ? `${import.meta.env.VITE_BACKEND_URL}/api` 
    : (import.meta.env.MODE === 'development' ? 'http://localhost:3000/api' : '/api'),
  withCredentials: true,
});

// Request interceptor to attach Bearer Token from localStorage for cross-domain queries
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});