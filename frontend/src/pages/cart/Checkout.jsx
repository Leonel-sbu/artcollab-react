import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

import { api } from "../../services/api";
import { stripeService } from "../../services/stripeService";

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";

function CheckoutForm({ orderId, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // Confirm payment (no redirect unless required)
      const result = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (result.error) {
        throw new Error(result.error.message || "Payment failed");
      }

      const paymentIntent = result.paymentIntent;
      if (!paymentIntent?.id) {
        throw new Error("No payment intent returned.");
      }

      // Tell backend to link PI -> Order (and/or trigger status update)
      await stripeService.confirm(orderId, paymentIntent.id);

      onPaid();
    } catch (err) {
      setError(err?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error ? (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <button
        disabled={!stripe || !elements || loading}
        className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();

  const [clientSecret, setClientSecret] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const stripePromise = useMemo(() => {
    if (!STRIPE_PK) return null;
    return loadStripe(STRIPE_PK);
  }, []);

  useEffect(() => {
    let alive = true;

    async function boot() {
      setLoading(true);
      setError("");

      try {
        if (!STRIPE_PK) {
          throw new Error(
            "Missing VITE_STRIPE_PUBLISHABLE_KEY in frontend .env"
          );
        }

        // 1) Create a pending order from the cart snapshot
        // If your backend path is different, update here:
        const checkoutRes = await api("/orders/checkout", { method: "POST" });

        const createdOrderId =
          checkoutRes?.orderId ||
          checkoutRes?.order?._id ||
          checkoutRes?.order?.id ||
          checkoutRes?._id;

        if (!createdOrderId) {
          throw new Error("Checkout did not return an orderId.");
        }

        // 2) Create payment intent
        const piRes = await stripeService.createPaymentIntent(createdOrderId);

        const secret =
          piRes?.clientSecret ||
          piRes?.client_secret ||
          piRes?.client_secret_key;

        if (!secret) {
          throw new Error(
            "Payment intent creation did not return client_secret."
          );
        }

        if (!alive) return;
        setOrderId(createdOrderId);
        setClientSecret(secret);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to start checkout.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    boot();
    return () => {
      alive = false;
    };
  }, []);

  const options = useMemo(
    () => ({
      clientSecret,
      appearance: { theme: "stripe" },
    }),
    [clientSecret]
  );

  function onPaid() {
    navigate("/orders");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-lg font-semibold">Checkout</div>
          <div className="mt-3 text-sm text-gray-600">Preparing payment...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-lg font-semibold">Checkout</div>
          <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="mt-4 rounded-xl bg-black px-4 py-2 text-white"
          >
            Back to cart
          </button>
        </div>
      </div>
    );
  }

  if (!stripePromise || !clientSecret) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-lg font-semibold">Checkout</div>
          <div className="mt-3 text-sm text-gray-600">
            Missing Stripe configuration.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Checkout</div>
            <div className="mt-1 text-xs text-gray-500">Order: {orderId}</div>
          </div>
        </div>

        <div className="mt-6">
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm orderId={orderId} onPaid={onPaid} />
          </Elements>
        </div>
      </div>
    </div>
  );
}
