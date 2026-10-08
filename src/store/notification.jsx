import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { isSoundMuted, playSuccessSound, setSoundMuted } from "../utils/audio";

const NotificationCtx = createContext(null);

let toastSeq = 1;

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [muted, setMutedState] = useState(() => isSoundMuted());
  const timersRef = useRef(new Map());

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      setSoundMuted(next);
      return next;
    });
  }, []);

  const removeToast = useCallback((id) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const title = toast.title || "Success";
    const message = toast.message || "";
    const key = `${title}_${message}`;

    // Deduplicate identical toasts posted within 1 second
    let duplicate = false;
    setToasts((prev) => {
      const now = Date.now();
      const existing = prev.find((t) => `${t.title}_${t.message}` === key && now - t.createdAt < 1200);
      if (existing) {
        duplicate = true;
        return prev;
      }
      return prev;
    });

    if (duplicate) return null;

    const id = "toast_" + Date.now() + "_" + toastSeq++;
    const duration = toast.duration ?? 3500;
    const shouldPlaySound = toast.sound !== false;

    if (shouldPlaySound) {
      playSuccessSound();
    }

    const item = {
      id,
      type: toast.type || "success",
      title,
      message,
      action: toast.action || null,
      image: toast.image || null,
      sku: toast.sku || null,
      kicker: toast.kicker || "AUREX SYSTEM UPDATE",
      duration,
      createdAt: Date.now(),
      sound: shouldPlaySound,
    };

    setToasts((prev) => {
      const now = Date.now();
      // Filter out recent duplicates if any raced
      const filtered = prev.filter((t) => !(`${t.title}_${t.message}` === key && now - t.createdAt < 1200));
      return [item, ...filtered].slice(0, 3);
    });

    if (duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    }

    return id;
  }, [removeToast]);

  const notify = {
    success: (opts) => addToast({ ...opts, type: "success" }),
    cart: (product, qty = 1, onOpenCart) => {
      const qtyText = qty > 1 ? `${qty} units` : "1 unit";
      return addToast({
        type: "cart",
        kicker: "CART UPDATED",
        title: "Added to Cart Successfully",
        message: `${product.name || product.sku} (${qtyText}) added to your dispatch list.`,
        sku: product.sku,
        image: product.image,
        action: onOpenCart ? { label: "View Cart", onClick: onOpenCart } : null,
        duration: 3500,
        sound: true,
      });
    },
    order: (order) => {
      return addToast({
        type: "order",
        kicker: "ORDER CONFIRMED",
        title: "Order Placed Successfully!",
        message: `Order #${order.id} is confirmed. Preparing for dispatch from Campbellfield VIC.`,
        action: { label: "Track Order", url: `/track?id=${order.id}` },
        duration: 5000,
        sound: true,
      });
    },
    info: (opts) => addToast({ ...opts, type: "info" }),
  };

  const clearToasts = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  return (
    <NotificationCtx.Provider value={{ toasts, addToast, removeToast, clearToasts, notify, muted, toggleMute }}>
      {children}
    </NotificationCtx.Provider>
  );
}

const fallbackNotification = {
  toasts: [],
  muted: false,
  toggleMute: () => {},
  addToast: () => "",
  removeToast: () => {},
  clearToasts: () => {},
  notify: {
    success: () => "",
    cart: () => "",
    order: () => "",
    info: () => "",
  },
};

export const useNotification = () => {
  const ctx = useContext(NotificationCtx);
  return ctx || fallbackNotification;
};
