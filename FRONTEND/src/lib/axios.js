import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pawsphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept unauthorized or token expiration errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pawsphere_token');
      localStorage.removeItem('pawsphere_user');
      // Force refresh to reload the auth states
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;
