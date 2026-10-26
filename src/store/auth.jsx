import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNotification } from "./notification";
import { api, setToken, getToken, tryRefresh, normaliseOrder } from "../lib/api";
import { loginApi, registerApi, logoutApi } from "../api/endpoints/auth.api";
import { apiClient, SESSION_EXPIRED_EVENT } from "../api/client";

const AuthCtx = createContext(null);
const SESSION_KEY = "aurex_session";
const ORDERS_KEY = "aurex_orders";
const LEGACY_ORDERS_KEY = "aurex-orders";

const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
const TEMP_SESSION_KEY = "aurex_session_temp";
const USER_KEY = "aurex_user";

/* Staff access comes from the role the server issued, never from the email address. */
const STAFF_ROLES = ["SUPER_ADMIN", "ADMIN", "admin"];
const withRole = (u) => ({ ...u, isAdmin: Boolean(u?.isAdmin) || STAFF_ROLES.includes(u?.role) });

/* Drop everything this device remembers about the signed-in account. */
const clearStoredSession = () => {
  try {
    localStorage.removeItem("aurex_access_token");
    localStorage.removeItem("aurex_refresh_token");
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(LEGACY_ORDERS_KEY);
    sessionStorage.removeItem("aurex_access_token");
    sessionStorage.removeItem(TEMP_SESSION_KEY);
  } catch { /* private mode */ }
};

const getErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  if (typeof err.message === "string") return err.message;
  if (typeof err.msg === "string") return err.msg;
  if (typeof err.error === "string") return err.error;
  if (err.error && typeof err.error.message === "string") return err.error.message;
  return fallback;
};

/* ───────────────────────── API-backed provider ─────────────────────────
   Active when VITE_API_URL is set. Mirrors orders into the `orders` state,
   which the existing effect persists to localStorage — so Account/Track/
   OrderSuccess (which read via utils/orders.js) keep working unchanged. */
function ApiAuthProvider({ children }) {
  const { notify } = useNotification();
  // The cached copy may carry an isAdmin worked out by older builds, so trust only its role
  // until /auth/me answers.
  const [user, setUser] = useState(() => {
    const cached = read(USER_KEY, null);
    return cached ? { ...cached, isAdmin: STAFF_ROLES.includes(cached.role) } : null;
  });
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState(() => read(ORDERS_KEY, []));

  // Persist orders so the sync localStorage readers (utils/orders.js) see them.
  useEffect(() => write(ORDERS_KEY, orders), [orders]);

  // Stable identity (pages list it as an effect dependency) and one request at a time,
  // so mounting the orders page while boot is loading them doesn't fire a second call.
  const ordersInFlight = useRef(null);
  const loadMyOrders = useCallback(() => {
    if (!getToken()) return Promise.resolve(undefined); // guests have no account orders
    if (!ordersInFlight.current) {
      ordersInFlight.current = (async () => {
        try {
          const res = await api.get("/orders/mine");
          const items = res?.items || res?.data?.items || res?.data || [];
          if (Array.isArray(items) && getToken()) {
            const normalised = items.map(normaliseOrder);
            setOrders(normalised);
            write(ORDERS_KEY, normalised);
            return normalised;
          }
        } catch { /* not logged in / none */ }
      })().finally(() => {
        ordersInFlight.current = null;
      });
    }
    return ordersInFlight.current;
  }, []);

  // A rejected refresh token means the session is over: sign out locally too, so the
  // header doesn't keep showing a logged-in account whose requests all fail.
  const userRef = useRef(user);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => {
    const onExpired = () => {
      const hadUser = Boolean(userRef.current);
      clearStoredSession();
      setOrders([]);
      setUser(null);
      if (hadUser) {
        notify.info({
          kicker: "SESSION EXPIRED",
          title: "Please log in again",
          message: "Your session has ended. Log in to see your orders and trade pricing.",
          icon: "login",
          sound: false,
        });
      }
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [notify]);

  // Restore an existing session on load or after external payment redirect
  useEffect(() => {
    (async () => {
      let hinted = true;
      try {
        hinted = Boolean(
          localStorage.getItem("aurex_access_token") ||
          localStorage.getItem(SESSION_KEY) ||
          localStorage.getItem(USER_KEY) ||
          sessionStorage.getItem(TEMP_SESSION_KEY)
        );
      } catch { /* private mode */ }

      if (hinted) {
        const token = getToken();
        if (token || (await tryRefresh())) {
          try {
            const res = await api.get("/auth/me");
            const me = res?.user || res?.data?.user || res?.data;
            if (me) {
              const fullUser = withRole(me);
              setUser(fullUser);
              write(USER_KEY, fullUser);
              await loadMyOrders();
            }
          } catch {
            // If token rejected, try refreshing once
            if (await tryRefresh()) {
              try {
                const res2 = await api.get("/auth/me");
                const me2 = res2?.user || res2?.data?.user || res2?.data;
                if (me2) {
                  const fullUser2 = withRole(me2);
                  setUser(fullUser2);
                  write(USER_KEY, fullUser2);
                  await loadMyOrders();
                }
              } catch {}
            }
          }
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signup = useCallback(async ({ name, email, password, phone, company }) => {
    try {
      const res = await registerApi({ name, email, password, phone, company });
      const createdUser = res.user;
      const accessToken = res.accessToken;
      const refreshToken = res.refreshToken;
      if (accessToken) {
        setToken(accessToken, refreshToken);
      }
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(createdUser?.email || email)); } catch { /* private mode */ }
      const fullUser = withRole(createdUser);
      setUser(fullUser);
      write(USER_KEY, fullUser);
      await loadMyOrders();
      return { ok: true, user: fullUser };
    } catch (e) {
      return { ok: false, msg: getErrorMessage(e, "Could not create account.") };
    }
  }, [loadMyOrders]);

  const login = useCallback(async ({ email, password, remember = true }) => {
    try {
      const res = await loginApi({ email, password });
      const loggedUser = res.user;
      const accessToken = res.accessToken;
      const refreshToken = res.refreshToken;
      if (accessToken) {
        setToken(accessToken, refreshToken);
        if (remember) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(email));
        } else {
          sessionStorage.setItem(TEMP_SESSION_KEY, JSON.stringify(email));
        }
      }
      const fullUser = withRole(loggedUser);
      setUser(fullUser);
      write(USER_KEY, fullUser);
      await loadMyOrders();
      return { ok: true, user: fullUser };
    } catch (e) {
      return { ok: false, msg: getErrorMessage(e, "Email or password did not match.") };
    }
  }, [loadMyOrders]);

  const logout = useCallback(() => {
    logoutApi().catch(() => {});
    setToken(null, null);
    setUser(null);
    setOrders([]);
    // Also forgets cached orders, so the next account on this device starts clean
    // (the cart store clears the local cart when it sees the user go).
    clearStoredSession();
    notify.info({
      kicker: "ACCOUNT LOGOUT",
      title: "Logged Out Successfully",
      message: "You have been signed out securely. Your cart is saved to your account for next time.",
      icon: "login",
      sound: false,
    });
  }, [notify]);

  // Checkout awaits this. Returns the created (normalised) order, or null on failure.
  const placeOrder = useCallback(async (order) => {
    try {
      const payload = {
        items: (order.items || []).map((l) => ({ sku: l.sku, qty: l.qty, name: l.name, price: l.price })),
        promoCode: order.promoCode || null,
        shipping: order.shipping,
        shippingFee: order.shippingFee,
        total: order.total,
        subtotal: order.subtotal,
        discount: order.discount,
        payment: order.payment,
        address: order.address,
      };
      const res = await api.post("/orders", payload);
      const created = res.order || res.data?.order || res.data;
      const norm = normaliseOrder(created);
      setOrders((o) => [norm, ...o]);
      try {
        const stored = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
        localStorage.setItem(ORDERS_KEY, JSON.stringify([norm, ...stored.filter((x) => x.id !== norm.id)]));
      } catch {}
      return norm;
    } catch (e) {
      notify.info({
        kicker: "ORDER FAILED",
        title: "We couldn't place your order",
        message: e.message || "Please check your details and try again.",
        sound: false,
      });
      return null;
    }
  }, [notify]);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const res = await apiClient.put("/auth/profile", profileData);
      const updatedUser = res?.data?.user || res?.user;
      if (updatedUser) {
        setUser((prev) => {
          const next = { ...prev, ...updatedUser };
          write(USER_KEY, next);
          return next;
        });
      }
      return { ok: true, user: updatedUser };
    } catch (e) {
      return { ok: false, msg: getErrorMessage(e, "Could not update profile.") };
    }
  }, []);

  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "login", onComplete: null });

  const openAuthModal = useCallback((options = {}) => {
    const mode = typeof options === "string" ? options : options?.mode || "login";
    const onComplete = typeof options === "object" && typeof options?.onComplete === "function" ? options.onComplete : null;
    setAuthModal({ isOpen: true, mode, onComplete });
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // One value object per real change, so consumers don't re-render on every provider render.
  const value = useMemo(() => ({
    user,
    setUser,
    updateProfile,
    session: user?.email || null,
    users,
    setUsers,
    signup,
    login,
    logout,
    orders,
    setOrders,
    myOrders: orders,
    loadMyOrders,
    refreshOrders: loadMyOrders,
    placeOrder,
    openAuthModal,
    closeAuthModal,
    authModal,
  }), [user, updateProfile, users, signup, login, logout, orders, loadMyOrders, placeOrder, openAuthModal, closeAuthModal, authModal]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function AuthProvider({ children }) {
  return <ApiAuthProvider>{children}</ApiAuthProvider>;
}

/* Safe default so no component crashes outside the provider. */
const authFallback = {
  user: null, session: null, users: [], orders: [], myOrders: [],
  setUsers: () => {}, setOrders: () => {}, logout: () => {},
  signup: () => ({ ok: false, msg: "Accounts are unavailable right now. Reload and try again." }),
  login: () => ({ ok: false, msg: "Login is unavailable right now. Reload and try again." }),
  placeOrder: () => ({ id: "AUX-0000" }),
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx && import.meta.env?.DEV) console.error("[auth] useAuth rendered without AuthProvider.");
  return ctx ?? authFallback;
};
