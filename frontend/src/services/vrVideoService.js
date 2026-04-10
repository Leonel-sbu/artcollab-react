import api from "./api";

export async function listVRVideos() {
  const { data } = await api.get("/api/vr-videos");
  return data;
}

export async function addVRVideo(payload) {
  const { data } = await api.post("/api/vr-videos", payload);
  return data;
}

export async function removeVRVideo(videoId) {
  const { data } = await api.delete(`/api/vr-videos/${videoId}`);
  return data;
}
