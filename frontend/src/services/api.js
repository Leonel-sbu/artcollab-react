import axios from "axios";

// Get API base URL - must be set in production!
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (!envUrl) {
    // In production without VITE_API_BASE_URL, fail fast
    if (import.meta.env.PROD) {
      throw new Error('VITE_API_BASE_URL is required in production');
    }
    // Development: Use relative path to leverage Vite proxy
    // This avoids CORS issues by forwarding through Vite's dev server
    console.warn('WARNING: VITE_API_BASE_URL not set, using relative path (via Vite proxy)');
    return '';  // Empty string = relative URL = uses Vite proxy
  }

  // Validate HTTPS in production
  if (import.meta.env.PROD && !envUrl.startsWith('https://')) {
    throw new Error('VITE_API_BASE_URL must use HTTPS in production');
  }

  return envUrl;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  // CRITICAL: Enable credentials for cookie-based auth
  withCredentials: true,
});

// CSRF token storage (in-memory for security - not localStorage)
let csrfToken = null;

// Fetch CSRF token from backend
// Call this on app initialization after user logs in
export async function fetchCsrfToken() {
  try {
    const res = await axios.get(
      `${getApiBaseUrl()}/api/csrf-token`,
      { withCredentials: true }
    );
    csrfToken = res.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
    return null;
  }
}

// Get current CSRF token
export function getCsrfToken() {
  return csrfToken;
}

// NOTE: Token-based auth (Authorization header) has been removed.
// Auth is now handled via httpOnly cookies set by the backend on login/register.
// The backend protect middleware reads from cookies automatically.
// CSRF protection is enforced via X-CSRF-Token header for state-changing requests.

// Request interceptor - adds CSRF token to state-changing requests
api.interceptors.request.use(
  (config) => {
    // Add CSRF token for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method?.toUpperCase())) {
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhanced error handling for better debugging
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const url = error.config?.url;

    // Log detailed error information
    if (status === 401) {
      console.log("Auth error:", message);
    } else if (status === 403) {
      console.log("Forbidden error:", message, "URL:", url);
    } else if (status === 404) {
      console.log("Not found:", "URL:", url);
    } else if (status >= 500) {
      console.log("Server error:", status, message);
    } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error("Network error detected:", error.message, "URL:", url);
      // Provide more context for network errors
      error.userMessage = 'Unable to connect to server. Please check your internet connection.';
    }

    return Promise.reject(error);
  }
);

export default api;
