import { api } from "./api";

export const stripeService = {
  async createPaymentIntent(orderId) {
    // Some backends accept orderId, some compute from cart without it.
    const body = orderId ? { orderId } : {};
    return api("/payments/create-payment-intent", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async confirm(orderId, paymentIntentId) {
    // Backend confirm route typically links PI -> Order
    return api("/payments/confirm", {
      method: "POST",
      body: JSON.stringify({ orderId, paymentIntentId }),
    });
  },
};
