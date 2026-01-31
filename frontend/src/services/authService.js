import { api } from "./api";

export const authService = {
  async login({ email, password }) {
    return api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  },
  async register({ name, email, password }) {
    return api("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
  },
  async me() {
    return api("/auth/me");
  },
};
