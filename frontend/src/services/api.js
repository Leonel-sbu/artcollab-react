
import axios from "axios";

/* ─────────────────────── BASE URL ────────────────────────────────── */
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  // Development → use Vite proxy
  if (!envUrl) {
    if (import.meta.env.DEV) {
      console.warn("[api] No VITE_API_URL set — using proxy");
      return "";
    }

    // Production fallback (prevents crash)
    console.error("[api] Missing VITE_API_URL in production");
    return "";
  }

  if (import.meta.env.PROD && !envUrl.startsWith("https://")) {
    console.warn("[api] API URL should use HTTPS in production");
  }

  return envUrl;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

/* ─────────────────────── CSRF TOKEN STORE ─────────────────────────── */
let csrfToken = null;
let fetchingCsrf = null;

export async function fetchCsrfToken() {
  if (fetchingCsrf) return fetchingCsrf;

  fetchingCsrf = api
    .get("/api/csrf-token")
    .then((res) => {
      csrfToken = res.data?.csrfToken || null;
      fetchingCsrf = null;
      return csrfToken;
    })
    .catch((err) => {
      fetchingCsrf = null;
      console.warn("[api] CSRF fetch failed:", err.message);
      return null;
    });

  return fetchingCsrf;
}

export function getCsrfToken() {
  return csrfToken;
}

export function clearCsrfToken() {
  csrfToken = null;
}

/* ─────────────────────── REQUEST INTERCEPTOR ─────────────────────── */
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
    const message = error.response?.data?.message || "";
    const url = error.config?.url || "";

    // Retry once on CSRF failure
    if (
      status === 403 &&
      message.toLowerCase().includes("csrf") &&
      !error.config?._retry
    ) {
      csrfToken = null;

      const newToken = await fetchCsrfToken();
      if (newToken && error.config) {
        error.config._retry = true;
        error.config.headers["X-CSRF-Token"] = newToken;
        return api(error.config);
      }
    }

    // Logging
    if (status === 401) {
      console.warn("[401 Unauthorized]", url);
    } else if (status === 403) {
      console.warn("[403 Forbidden]", url);
    } else if (status === 404) {
      console.warn("[404 Not Found]", url);
    } else if (status >= 500) {
      console.error("[Server Error]", status, message);
    } else if (!status) {
      console.error("[Network Error]", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
