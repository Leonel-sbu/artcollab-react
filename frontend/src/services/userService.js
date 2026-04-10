import api from "./api";

export async function getUserProfile(userId) {
  const { data } = await api.get(`/api/users/${userId}`);
  return data;
}

export async function getUserArtworks(userId) {
  const { data } = await api.get(`/api/users/${userId}/artworks`);
  return data;
}

export async function followUser(userId) {
  const { data } = await api.post(`/api/users/${userId}/follow`);
  return data;
}

export async function unfollowUser(userId) {
  const { data } = await api.delete(`/api/users/${userId}/follow`);
  return data;
}

export async function uploadAvatar(file) {
  const fd = new FormData();
  fd.append("avatar", file);
  const { data } = await api.post("/api/users/avatar", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
