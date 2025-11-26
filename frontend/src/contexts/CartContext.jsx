// src/contexts/CartContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  apiGetCart,
  apiAddCartItem,
  apiRemoveCartItem,
  apiIncreaseCartItem,
  apiDecreaseCartItem,
} from "../api";

import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart-cache");
      return saved ? JSON.parse(saved) : { items: [], total: 0 };
    } catch {
      return { items: [], total: 0 };
    }
  });

  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const normalizeCart = (data) => {
    if (!data || typeof data !== "object") return { items: [], total: 0 };

    // Backend returns: {"detail": "Cart is empty"}
    if ("detail" in data && !("items" in data)) return { items: [], total: 0 };

    return {
      id: data.id ?? null,
      status: data.status ?? "pending",
      items: Array.isArray(data.items) ? data.items : [],
      total: Number(data.total || 0),
    };
  };

  const load = useCallback(async () => {
    try {
      const data = await apiGetCart();
      const normalized = normalizeCart(data);

      setCart((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(normalized)) {
          return prev;
        }
        return normalized;
      });

      localStorage.setItem("cart-cache", JSON.stringify(normalized));
    } catch (err) {
      console.error("Cart load failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const clone = (obj) => JSON.parse(JSON.stringify(obj));
  const calcTotal = (items) =>
    items.reduce(
      (sum, i) => sum + Number(i.unit_price ?? 0) * Number(i.quantity ?? 1),
      0
    );
  const saveToCache = (data) =>
    localStorage.setItem("cart-cache", JSON.stringify(data));
  const findItem = (product_id) =>
    cart.items.find((i) => i.product.id === product_id);

  /* ===========================================================
      FIX #1 — ADD: if backend says "Item not in cart", reset cart
  =========================================================== */

  const resetCart = () => {
    const empty = { items: [], total: 0, status: "empty" };
    setCart(empty);
    saveToCache(empty);
  };

  /* ===========================================================
      ADD ITEM 
  =========================================================== */
  const addItem = async ({ product, quantity = 1 }) => {
    if (!product || !product.id) return;

    const product_id = product.id;
    const prev = clone(cart);

    let newItems = [...cart.items];
    const existing = findItem(product_id);

    if (existing) {
      newItems = newItems.map((i) =>
        i.product.id === product_id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      const effPrice = product.discounted_price ?? product.price ?? 0;
      newItems.push({
        id: "temp-" + Math.random(),
        quantity,
        unit_price: effPrice,
        product: {
          id: product.id,
          title: product.title,
          images: product.images,
          price: product.price,
          discounted_price: product.discounted_price,
        },
      });
    }

    const optimistic = { items: newItems, total: calcTotal(newItems) };
    setCart(optimistic);
    saveToCache(optimistic);

    toast.success("Added to cart!");

    try {
      const updated = await apiAddCartItem(product_id, quantity);
      const normalized = normalizeCart(updated);
      setCart(normalized);
      saveToCache(normalized);
      return updated;
    } catch (err) {
      // Checkout already happened OR cart expired
      if (err?.response?.status === 404) {
        resetCart();
        return;
      }

      setCart(prev);
      saveToCache(prev);
      toast.error("Failed to add item");
      throw err;
    }
  };

  /* ===========================================================
      INCREASE
  =========================================================== */
  const increase = async ({ product_id }) => {
    const prev = clone(cart);

    const newItems = cart.items.map((i) =>
      i.product.id === product_id ? { ...i, quantity: i.quantity + 1 } : i
    );

    const optimistic = { items: newItems, total: calcTotal(newItems) };
    setCart(optimistic);
    saveToCache(optimistic);

    try {
      const updated = await apiIncreaseCartItem(product_id);
      const normalized = normalizeCart(updated);
      setCart(normalized);
      saveToCache(normalized);
    } catch (err) {
      if (err?.response?.status === 404) {
        resetCart();
        return;
      }

      setCart(prev);
      saveToCache(prev);
      throw err;
    }
  };

  /* ===========================================================
      DECREASE
  =========================================================== */
  const decrease = async ({ product_id }) => {
    const prev = clone(cart);

    let newItems = cart.items.map((i) =>
      i.product.id === product_id
        ? { ...i, quantity: Math.max(1, i.quantity - 1) }
        : i
    );

    newItems = newItems.filter((i) => i.quantity > 0);

    const optimistic = { items: newItems, total: calcTotal(newItems) };
    setCart(optimistic);
    saveToCache(optimistic);

    try {
      const updated = await apiDecreaseCartItem(product_id);
      const normalized = normalizeCart(updated);
      setCart(normalized);
      saveToCache(normalized);
    } catch (err) {
      if (err?.response?.status === 404) {
        resetCart();
        return;
      }

      setCart(prev);
      saveToCache(prev);
      throw err;
    }
  };

  /* ===========================================================
      REMOVE ITEM
  =========================================================== */
  const removeItem = async (item_id) => {
    const prev = clone(cart);

    const newItems = cart.items.filter((i) => i.id !== item_id);
    const optimistic = { items: newItems, total: calcTotal(newItems) };

    setCart(optimistic);
    saveToCache(optimistic);

    try {
      const updated = await apiRemoveCartItem(item_id);
      const normalized = normalizeCart(updated);
      setCart(normalized);
      saveToCache(normalized);
      toast.success("Item removed");
    } catch (err) {
      // checkout happened → cart is gone
      if (err?.response?.status === 404) {
        resetCart();
        return;
      }

      setCart(prev);
      saveToCache(prev);
      toast.error("Failed to remove item");
      throw err;
    }
  };

  /* =========================================================== */

  const openCart = () => setDrawerOpen(true);
  const closeCart = () => setDrawerOpen(false);
  const toggleCart = () => setDrawerOpen((v) => !v);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,

        addItem,
        removeItem,
        increase,
        decrease,

        drawerOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
