import axios from 'axios';

// In production, set VITE_API_URL to your deployed backend's HTTPS URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send/receive httpOnly accessToken & refreshToken cookies
});

// Access tokens are short-lived (15m). When one expires mid-session, the
// backend replies 401 "Access token expired". We catch that once, silently
// call /auth/refresh (which reads the refreshToken cookie and sets a new
// accessToken cookie), then retry the original request. If refresh also
// fails, the user is genuinely logged out.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response || response.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    // Don't try to "refresh" the refresh call itself or the login/register calls.
    if (config.url?.includes('/auth/refresh') || config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    config._retry = true;

    try {
      // Share one in-flight refresh across requests that 401 at the same time.
      refreshPromise = refreshPromise || api.post('/auth/refresh');
      await refreshPromise;
      refreshPromise = null;
      return api(config);
    } catch (refreshError) {
      refreshPromise = null;
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);
    }
  }
);

export default api;
