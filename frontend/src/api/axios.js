import axios from 'axios';
import { store } from '../store';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const { token } = store.getState().auth;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch({ type: 'auth/logout' });
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.config.url.includes('/objects')) {
      if (error.response.status === 404) {
        return Promise.reject(new Error('Объект не найден'));
      }
      if (error.response.status === 400) {
        return Promise.reject(new Error('Некорректные данные объекта'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;