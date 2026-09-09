import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const GUEST_CART_KEY = "guestCart";

const readGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
};
const writeGuestCart = (items) => localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));

// Normalizes both the guest (localStorage) cart shape and the backend cart
// (populated Product refs) into one flat shape the UI can render the same way.
const normalizeBackendCart = (cart) =>
  (cart?.products || [])
    .filter((item) => item.product)
    .map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }));

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(readGuestCart);
  const [loading, setLoading] = useState(false);

  const loadBackendCart = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setItems(normalizeBackendCart(data));
    } finally {
      setLoading(false);
    }
  }, []);

  // On login, push whatever was in the guest cart into the backend cart,
  // then switch over to backend-backed state for the rest of the session.
  useEffect(() => {
    if (!isAuthenticated) return;

    const merge = async () => {
      const guestItems = readGuestCart();
      setLoading(true);
      try {
        for (const item of guestItems) {
          await api.post("/cart", { productId: item.productId, quantity: item.quantity });
        }
        writeGuestCart([]);
        await loadBackendCart();
      } finally {
        setLoading(false);
      }
    };

    merge();
    // Only re-run when auth status actually flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (isAuthenticated) {
        await api.post("/cart", { productId: product._id, quantity });
        await loadBackendCart();
        return;
      }
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === product._id);
        const next = existing
          ? prev.map((i) => (i.productId === product._id ? { ...i, quantity: i.quantity + quantity } : i))
          : [
              ...prev,
              {
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity,
              },
            ];
        writeGuestCart(next);
        return next;
      });
    },
    [isAuthenticated, loadBackendCart]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (isAuthenticated) {
        await api.delete(`/cart/${productId}`);
        await loadBackendCart();
        return;
      }
      setItems((prev) => {
        const next = prev.filter((i) => i.productId !== productId);
        writeGuestCart(next);
        return next;
      });
    },
    [isAuthenticated, loadBackendCart]
  );

  const clearGuestCart = useCallback(() => {
    writeGuestCart([]);
    if (!isAuthenticated) setItems([]);
  }, [isAuthenticated]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, loading, addItem, removeItem, clearGuestCart, refresh: loadBackendCart, total, count }),
    [items, loading, addItem, removeItem, clearGuestCart, loadBackendCart, total, count]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
