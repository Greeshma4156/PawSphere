import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Intercept unauthorized errors (session expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('pawsphere_user');
      // Force refresh to reload the auth states
      window.location.href = '/login?expired=true';
    }
    return Promise.reject(error);
  }
);

export default api;

