import axios from 'axios';

// SECURITY NOTE (medium risk): The JWT is stored in localStorage which makes
// it readable by any JavaScript running on this origin.  If an XSS
// vulnerability is introduced, an attacker could exfiltrate the token.
// Future hardening: move token storage to an httpOnly, SameSite=Strict cookie
// and update the backend to read it from there instead.  This is a significant
// refactor and has been deferred; the XSS risk is mitigated by React's
// automatic output encoding and the CSP header set on the backend.

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
