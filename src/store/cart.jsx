import { createContext, useContext, useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNotification } from "./notification";
import { useAuth } from "./auth";
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
} from "../api/endpoints/cart.api";

const CartCtx = createContext(null);
// Just the (stable) actions, for components like the product card that only add to cart
// and shouldn't re-render every time the cart's contents change.
const CartActionsCtx = createContext(null);
const CART_KEY = "aurex_cart_v1";

const readCart = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(saved)
      ? saved.filter((l) => l && l.sku && typeof l.price === "number" && l.qty > 0)
      : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [lines, setLines] = useState(readCart);
  const [serverCart, setServerCart] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [open, setOpen] = useState(false);
  const [compare, setCompare] = useState([]);
  const { notify } = useNotification();
  const { user } = useAuth();
  const userId = user ? user.id || user._id || user.email || "user" : null;
  const syncedForRef = useRef(null);
  const linesRef = useRef(lines);
  const compareRef = useRef(compare);

  // Sync lines to localStorage so private/offline mode and refresh don't drop items
  useEffect(() => {
    linesRef.current = lines;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {
      /* private mode */
    }
  }, [lines]);

  useEffect(() => {
    compareRef.current = compare;
  }, [compare]);

  // When user logs in or creates account: automatically push local cart to the user's cart in the backend!
  useEffect(() => {
    if (!userId) {
      // Signed out (or the session ended): those lines belong to that account and stay saved
      // on the server, so don't hand them to the next person who uses this device.
      if (syncedForRef.current) {
        setLines([]);
        try {
          localStorage.removeItem(CART_KEY);
        } catch { /* private mode */ }
      }
      syncedForRef.current = null;
      setServerCart(null);
      return;
    }

    // Once per account. Boot restores the user from storage and then again from /auth/me;
    // two overlapping merges would both push the guest lines and double the quantities.
    if (syncedForRef.current === userId) return;
    syncedForRef.current = userId;

    const syncUserCart = async () => {
      try {
        setIsSyncing(true);
        let remote = await getCartApi();
        const remoteLines = remote?.lines || [];

        // Transfer any guest items that aren't yet in the remote cart
        const localItems = readCart();
        const unmerged = localItems.filter(
          (loc) => !remoteLines.some((r) => r.sku === loc.sku.toUpperCase())
        );

        if (unmerged.length > 0) {
          for (const item of unmerged) {
            try {
              await addToCartApi({
                productId: item.productId || item.id || item.sku,
                sku: item.sku,
                quantity: item.qty,
              });
            } catch (err) {
              console.warn("[cart] Could not transfer item to user cart:", item.sku, err);
            }
          }
          remote = await getCartApi();
        }

        if (remote && Array.isArray(remote.lines)) {
          setServerCart(remote);
          setLines(remote.lines);
        }
      } catch (err) {
        if (err?.status !== 401) {
          console.warn("[cart] Could not sync user cart from API, maintaining local cart:", err?.message || err);
        }
      } finally {
        setIsSyncing(false);
      }
    };

    syncUserCart();
  }, [userId]);

  // Add to cart: If guest, stays strictly local in localStorage. If logged in, syncs to backend API.
  const add = useCallback(async (product, qty = 1, selectedFitment = null) => {
    const sku = (product?.sku || "").toUpperCase();
    if (!sku) return;

    // Tail lift products cannot be bought directly online - enquiry required
    const isTailLift =
      product?.category === "tail-lifts" ||
      product?.categorySlug === "tail-lifts" ||
      sku.startsWith("ATP-TL") ||
      product?.isBuyable === false ||
      product?.pricing?.isPOA === true;

    if (isTailLift) {
      notify.error({
        kicker: "ENQUIRY REQUIRED",
        title: "Tail Lift Quotation Required",
        message: `${product.name || sku} requires custom engineering specifications. Please submit an enquiry first.`,
        duration: 5000,
      });
      return;
    }

    const previousLines = [...linesRef.current];

    // Local state update
    setLines((prev) => {
      const found = prev.find((l) => l.sku === sku);
      if (found) {
        return prev.map((l) =>
          l.sku === sku ? { ...l, qty: Math.min(99, l.qty + qty) } : l
        );
      }
      return [
        ...prev,
        {
          id: product._id || product.id || sku,
          itemId: product._id || product.id || sku,
          productId: product._id || product.id || sku,
          sku,
          name: product.name || sku,
          price: typeof product.price === "number" ? product.price : (product.pricing?.sellingPrice || 0),
          qty,
          image:
            product.imageUrl ||
            product.image ||
            (Array.isArray(product.images) && product.images.length > 0
              ? typeof product.images[0] === "string"
                ? product.images[0]
                : product.images[0]?.url
              : null),
        },
      ];
    });

    // Notify immediately
    notify.cart(product, qty, () => setOpen(true));

    // Without login, cart stays 100% local!
    if (!user) {
      return;
    }

    // If logged in, dispatch to user's cart API
    try {
      setIsSyncing(true);
      const res = await addToCartApi({
        productId: product._id || product.id,
        sku,
        quantity: qty,
        selectedFitment,
      });

      if (res && Array.isArray(res.lines)) {
        setServerCart(res);
        setLines(res.lines);
      }
    } catch (err) {
      console.error("[cart] addToCartApi error:", err);
      setLines(previousLines);
      notify.error({
        kicker: "CART NOTIFICATION",
        title: "Could not add to cart",
        message: err.message || "Failed to add item to your cart.",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [user, notify]);

  // Set quantity: local for guests, API for logged-in users
  const setQty = useCallback(async (skuOrItemId, qty) => {
    const previousLines = [...linesRef.current];
    const targetSku = String(skuOrItemId).toUpperCase();

    setLines((prev) => {
      if (qty <= 0) {
        return prev.filter((l) => l.sku !== targetSku && l.itemId !== skuOrItemId && l.id !== skuOrItemId);
      }
      return prev.map((l) => {
        if (l.sku === targetSku || l.itemId === skuOrItemId || l.id === skuOrItemId) {
          return { ...l, qty: Math.min(99, qty) };
        }
        return l;
      });
    });

    // Without login, stay local
    if (!user) {
      return;
    }

    try {
      setIsSyncing(true);
      const res = await updateCartItemApi(skuOrItemId, qty);
      if (res && Array.isArray(res.lines)) {
        setServerCart(res);
        setLines(res.lines);
      }
    } catch (err) {
      console.error("[cart] updateCartItemApi error:", err);
      setLines(previousLines);
      notify.error({
        title: "Could not update quantity",
        message: err.message || "Warehouse stock check failed.",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [user, notify]);

  // Remove item: local for guests, API for logged-in users
  const remove = useCallback(async (skuOrItemId) => {
    const previousLines = [...linesRef.current];
    const targetSku = String(skuOrItemId).toUpperCase();

    setLines((prev) =>
      prev.filter((l) => l.sku !== targetSku && l.itemId !== skuOrItemId && l.id !== skuOrItemId)
    );

    if (!user) {
      return;
    }

    try {
      setIsSyncing(true);
      const res = await removeFromCartApi(skuOrItemId);
      if (res && Array.isArray(res.lines)) {
        setServerCart(res);
        setLines(res.lines);
      }
    } catch (err) {
      console.error("[cart] removeFromCartApi error:", err);
      setLines(previousLines);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  // Clear cart: local for guests, API for logged-in users
  const clear = useCallback(async () => {
    setLines([]);
    setServerCart(null);
    try {
      localStorage.removeItem(CART_KEY);
    } catch { /* noop */ }

    if (!user) {
      return;
    }

    try {
      await clearCartApi();
    } catch (err) {
      console.error("[cart] clearCartApi error:", err);
    }
  }, [user]);

  // Compare functions preserved
  const toggleCompare = useCallback((sku) => {
    const adding = !compareRef.current.includes(sku);
    setCompare((c) => {
      const exists = c.includes(sku);
      if (exists) return c.filter((x) => x !== sku);
      return [...c, sku].slice(-3);
    });

    if (adding) {
      notify.success({
        kicker: "COMPARISON UPDATED",
        title: "Added to Compare",
        message: `Part ${sku} added to comparison list.`,
        icon: "tag",
        sound: true,
      });
    }
  }, [notify]);

  const clearCompare = useCallback(() => setCompare([]), []);

  const total = useMemo(
    () =>
      user && serverCart?.total != null
        ? serverCart.total
        : lines.reduce((s, l) => s + (l.price || 0) * (l.qty || 1), 0),
    [user, serverCart, lines]
  );

  const count = useMemo(
    () =>
      user && serverCart?.count != null
        ? serverCart.count
        : lines.reduce((s, l) => s + (l.qty || 1), 0),
    [user, serverCart, lines]
  );

  const actions = useMemo(
    () => ({ add, setQty, remove, clear, setOpen, toggleCompare, clearCompare }),
    [add, setQty, remove, clear, toggleCompare, clearCompare]
  );

  const value = useMemo(
    () => ({
      lines,
      ...actions,
      total,
      count,
      open,
      compare,
      isSyncing,
      serverCart,
    }),
    [lines, actions, total, count, open, compare, isSyncing, serverCart]
  );

  return (
    <CartActionsCtx.Provider value={actions}>
      <CartCtx.Provider value={value}>
        {children}
      </CartCtx.Provider>
    </CartActionsCtx.Provider>
  );
}

const cartFallback = {
  lines: [],
  total: 0,
  count: 0,
  open: false,
  compare: [],
  isSyncing: false,
  add: () => {},
  setQty: () => {},
  remove: () => {},
  clear: () => {},
  setOpen: () => {},
  toggleCompare: () => {},
  clearCompare: () => {},
  serverCart: null,
};

export const useCart = () => {
  const ctx = useContext(CartCtx);
  if (!ctx && import.meta.env?.DEV) console.error("[cart] useCart rendered without CartProvider.");
  return ctx ?? cartFallback;
};

/* Actions only; the returned object doesn't change when lines, totals or the drawer change. */
export const useCartActions = () => useContext(CartActionsCtx) ?? cartFallback;
