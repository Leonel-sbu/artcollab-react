const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export function resolveImageUrl(path) {
  if (!path) return "";

  // already absolute
  if (path.startsWith("http")) return path;

  // already correct
  if (path.startsWith("/uploads")) {
    return `${API_BASE}${path}`;
  }

  // filename only  uploads/posts
  return `${API_BASE}/uploads/posts/${path}`;
}
