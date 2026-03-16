import api from "./api";

export async function register(payload) {
    const { data } = await api.post("/api/auth/register", payload);
    return data; // expects { success, token, user? }
}

export async function login(payload) {
    const { data } = await api.post("/api/auth/login", payload);
    return data;
}

export async function forgotPassword(payload) {
    const { data } = await api.post("/api/auth/forgot-password", payload);
    return data;
}

export async function resetPassword(payload) {
    const { data } = await api.post("/api/auth/reset-password", payload);
    return data;
}
