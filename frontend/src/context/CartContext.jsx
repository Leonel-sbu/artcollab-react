import { createContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export const CartContext = createContext(null);

export default function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  async function refresh() {
    setCartLoading(true);
    setCartError("");
    try {
      const res = await api("/cart");
      const list = res?.items || res?.cart?.items || res || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setCartError(e?.message || "Failed to load cart");
      setItems([]);
    } finally {
      setCartLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function addItem(payload) {
    const res = await api("/cart/add", { method: "POST", body: JSON.stringify(payload) });
    await refresh();
    return res;
  }

  async function removeItem(payload) {
    const res = await api("/cart/remove", { method: "POST", body: JSON.stringify(payload) });
    await refresh();
    return res;
  }

  async function clearCart() {
    await api("/cart/clear", { method: "POST" }).catch(() => {});
    await refresh();
  }

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const price = Number(it?.price || it?.artwork?.price || it?.course?.price || 0);
      const qty = Number(it?.quantity || 1);
      return sum + price * qty;
    }, 0);
  }, [items]);

  const value = useMemo(() => ({
    items,
    total,
    cartLoading,
    cartError,
    refresh,
    addItem,
    removeItem,
    clearCart,
  }), [items, total, cartLoading, cartError]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
