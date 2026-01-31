const RAW_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function normalizeBase(raw) {
  // If user sets http://localhost:5000/api we keep it.
  // If user sets http://localhost:5000 we append /api.
  const trimmed = String(raw).replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const API_BASE = normalizeBase(RAW_BASE);

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.error ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
