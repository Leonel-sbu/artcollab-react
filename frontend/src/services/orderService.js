import { api } from "./api";

export const orderService = {
  async mine() {
    return api("/orders/mine");
  },

  async checkout() {
    return api("/orders/checkout", { method: "POST" });
  },
};
