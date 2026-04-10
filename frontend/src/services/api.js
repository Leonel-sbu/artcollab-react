import axios from "axios";

/* ─────────────────────── BASE URL ────────────────────────────────── */
// In development: leave baseURL empty so every request goes through the
// Vite dev-server proxy (vite.config.js → /api → http://localhost:5000).
// In production: set VITE_API_BASE_URL to your deployed backend URL.
const getApiBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;

  if (!envUrl) {
    if (import.meta.env.PROD) {
      throw new Error(
        "VITE_API_BASE_URL must be set in production (e.g. https://api.yourdomain.com)"
      );
    }
    // Development default — uses Vite proxy, no CORS issues
    return "";
  }

  if (import.meta.env.PROD && !envUrl.startsWith("https://")) {
    throw new Error("VITE_API_BASE_URL must use HTTPS in production");
  }

  return envUrl;
};

const api = axios.create({
  baseURL: getApiBaseUrl() || undefined,
  withCredentials: true, // Send httpOnly auth cookie + CSRF secret cookie
});

/* ─────────────────────── CSRF TOKEN STORE ─────────────────────────── */
// Stored in memory only (never localStorage) — survives page navigation
// but is cleared on full page reload, triggering a fresh fetch.
let csrfToken = null;

// Deduplicated fetch — concurrent requests won't each trigger their own call
let _fetchingCsrf = null;

export async function fetchCsrfToken() {
  if (_fetchingCsrf) return _fetchingCsrf;

  _fetchingCsrf = api
    .get("/api/csrf-token")
    .then((res) => {
      csrfToken = res.data?.csrfToken ?? null;
      _fetchingCsrf = null;
      return csrfToken;
    })
    .catch((err) => {
      _fetchingCsrf = null;
      console.warn("[api] Could not fetch CSRF token:", err.message);
      return null;
    });

  return _fetchingCsrf;
}

export function getCsrfToken() {
  return csrfToken;
}

export function clearCsrfToken() {
  csrfToken = null;
}

/* ─────────────────────── REQUEST INTERCEPTOR ─────────────────────── */
// Attach CSRF token to every state-changing request.
api.interceptors.request.use(
  async (config) => {
    const method = config.method?.toUpperCase();
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      if (!csrfToken) {
        await fetchCsrfToken();
      }
      if (csrfToken) {
        config.headers["X-CSRF-Token"] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─────────────────────── RESPONSE INTERCEPTOR ────────────────────── */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message ?? "";
    const url = error.config?.url ?? "";

    // Auto-retry once when the server reports an expired/invalid CSRF token.
    // This handles the race condition where the token expires between page
    // load and the first mutating request.
    if (
      status === 403 &&
      message.toLowerCase().includes("csrf") &&
      !error.config?._csrfRetried
    ) {
      csrfToken = null;
      const fresh = await fetchCsrfToken();
      if (fresh && error.config) {
        error.config._csrfRetried = true;
        error.config.headers["X-CSRF-Token"] = fresh;
        return api(error.config);
      }
    }

    // Structured logging for easier debugging
    if (status === 401) {
      console.warn("[api 401]", message, url);
    } else if (status === 403) {
      console.warn("[api 403]", message, url);
    } else if (status === 404) {
      console.warn("[api 404]", url);
    } else if (status >= 500) {
      console.error("[api 5xx]", status, message, url);
    } else if (!status && error.code !== 'ERR_CANCELED' && error.name !== 'AbortError') {
      // Network error / ECONNABORTED / proxy down (not a user-initiated cancel)
      console.error("[api network]", error.message, url);
      error.userMessage =
        "Cannot reach the server. Check that the backend is running.";
    }

    return Promise.reject(error);
  }
);

export default api;
