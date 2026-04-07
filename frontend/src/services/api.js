import axios from 'axios';

const apiOrigin = import.meta.env.VITE_API_URL || '';
const baseURL = apiOrigin ? `${apiOrigin.replace(/\/$/, '')}/api/v1` : '/api/v1';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const origin = apiOrigin.replace(/\/$/, '');
  return origin ? `${origin}${path.startsWith('/') ? path : `/${path}`}` : `${path.startsWith('/') ? path : `/${path}`}`;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const publicAuth = ['/login', '/register'].some((p) =>
        window.location.pathname.endsWith(p)
      );
      if (!publicAuth) {
        localStorage.removeItem('gt_token');
        localStorage.removeItem('gt_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
