import React, { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { stripeService } from "../../services/stripeService";
import { orderService } from "../../services/orderService";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load latest order (newest pending) and create payment intent
  const loadOrderAndPI = async () => {
    try {
      setError("");
      setSuccess("");

      const mine = await orderService.mine();
      const items = mine?.items || [];

      const pending = items.filter(o => o.status === "pending");
      const latest = (pending.length ? pending : items)
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      if (!latest?._id) {
        setError("No order found. Please add items to cart and checkout first.");
        return;
      }

      setOrder(latest);

      if (latest.status === "pending") {
        const pi = await stripeService.createPaymentIntent(latest._id);
        setClientSecret(pi.clientSecret);
      }
    } catch (e) {
      setError(e.message || "Failed to start checkout");
    }
  };

  useEffect(() => {
    loadOrderAndPI();
  }, []);

  const refreshOrder = async () => {
    const mine = await orderService.mine();
    const updated = (mine?.items || []).find(o => o._id === order?._id);
    if (updated) setOrder(updated);
  };

  const onPay = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!stripe || !elements) return;

    if (!order?._id || !clientSecret) {
      setError("Missing order or client secret.");
      return;
    }

    setLoading(true);
    try {
      const card = elements.getElement(CardElement);
      const { error: stripeErr, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card },
        });

      if (stripeErr) {
        setError(stripeErr.message || "Payment failed");
        return;
      }

      if (!paymentIntent?.id) {
        setError("No paymentIntent returned.");
        return;
      }

      await stripeService.confirm(order._id, paymentIntent.id);

      setSuccess("Payment succeeded. Order marked as paid.");
      await refreshOrder();
    } catch (e) {
      setError(e.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        Checkout
      </h2>

      {order && (
        <div style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 16
        }}>
          <div><b>Order:</b> {order._id}</div>
          <div><b>Status:</b> {order.status}</div>
          <div><b>Subtotal:</b> {order.subtotal} {order.currency}</div>
        </div>
      )}

      {error && (
        <div style={{
          background: "#ffe5e5",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: "#e7ffe5",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12
        }}>
          {success}
        </div>
      )}

      {order?.status === "paid" ? (
        <div style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8
        }}>
           This order is paid.
        </div>
      ) : (
        <form onSubmit={onPay} style={{
          padding: 12,
          border: "1px solid #ddd",
          borderRadius: 8
        }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 8 }}>
              Card details
            </label>
            <div style={{
              padding: 12,
              border: "1px solid #ccc",
              borderRadius: 8
            }}>
              <CardElement options={{ hidePostalCode: true }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || !elements || loading || !clientSecret}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            {loading ? "Processing..." : "Pay now"}
          </button>

          <p style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Test card: <b>4242 4242 4242 4242</b> any future date any CVC
          </p>
        </form>
      )}
    </div>
  );
}

export default function Checkout() {
  const pk = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  const options = useMemo(() => ({
    appearance: { theme: "stripe" },
  }), []);

  if (!pk) {
    return (
      <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
        Missing VITE_STRIPE_PUBLISHABLE_KEY in frontend .env
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
}
