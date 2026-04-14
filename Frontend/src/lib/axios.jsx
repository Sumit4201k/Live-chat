import axios from 'axios';

export const instance = axios.create({
baseURL: import.meta.env.MODE === 'development' ? 'http://localhost:5000' : '/api',
withCredentials: true,
});