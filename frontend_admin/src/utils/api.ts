import axios from 'axios';

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BACKEND,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token:string)=>void; reject: (err:any)=>void }> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token as string);
  });
  failedQueue = [];
}

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sw_token') : null;
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const originalRequest = err.config;
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(e => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        // create a bare axios instance for refresh to avoid interceptor recursion
        const axiosLib = require('axios');
        const refreshClient = axiosLib.create({ baseURL: BACKEND, withCredentials: true });
        refreshClient.post('/api/auth/refresh')
          .then(r => r.data)
          .then((data) => {
            if (data.token) {
              localStorage.setItem('sw_token', data.token);
              localStorage.setItem('sw_user_role', data.user?.role || localStorage.getItem('sw_user_role') || 'user');
              api.defaults.headers.common['Authorization'] = 'Bearer ' + data.token;
              processQueue(null, data.token);
              resolve(api(originalRequest));
            } else {
              processQueue(new Error('No token in refresh response'), null);
              reject(err);
            }
          }).catch(e => {
            processQueue(e, null);
            reject(e);
          }).finally(() => { isRefreshing = false; });
      });
    }
    return Promise.reject(err);
  }
);

export default api;
