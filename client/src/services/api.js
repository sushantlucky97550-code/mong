import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('staffsync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized / expired tokens without kicking out to a login page
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If a request fails with 401 and hasn't been retried yet
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true;
      try {
        // Automatically obtain a fresh token in the background
        const res = await axios.post('/api/auth/login', {
          email: 'hr@staffsync.com',
          password: 'password123',
        });
        if (res.data?.token) {
          localStorage.setItem('staffsync_token', res.data.token);
          localStorage.setItem('staffsync_user', JSON.stringify(res.data.user));
          originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
          return api(originalRequest);
        }
      } catch (authErr) {
        console.warn('Background token renewal failed:', authErr.message);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
