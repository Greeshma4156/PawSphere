import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Flag to prevent multiple 401 redirects firing simultaneously
let isRedirecting = false;

// Call this after a successful login to re-enable the interceptor
export const resetAuthInterceptor = () => {
  isRedirecting = false;
};

// Attach JWT token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pawsphere_token');
    if (token && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept unauthorized errors (session expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config && (
      error.config.url.includes('/auth/login') ||
      error.config.url.includes('/auth/signup')
    );

    if (
      error.response &&
      error.response.status === 401 &&
      !isAuthRoute &&
      !isRedirecting
    ) {
      isRedirecting = true;
      localStorage.removeItem('pawsphere_user');
      localStorage.removeItem('pawsphere_token');
      // Use a short delay to let any in-flight requests settle before redirect
      setTimeout(() => {
        window.location.href = '/login?expired=true';
      }, 100);
    }
    return Promise.reject(error);
  }
);

export default api;
