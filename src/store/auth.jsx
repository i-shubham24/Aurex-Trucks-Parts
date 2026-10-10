import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNotification } from "./notification";
import { api, setToken, getToken, tryRefresh, normaliseOrder } from "../lib/api";
import { loginApi, registerApi, logoutApi } from "../api/endpoints/auth.api";
import { setAuthToken } from "../api/client";

const AuthCtx = createContext(null);
const SESSION_KEY = "aurex_session";
const ORDERS_KEY = "aurex_orders";

export const ADMIN_EMAIL = "admin@aurex.com.au";

const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
const TEMP_SESSION_KEY = "aurex_session_temp";
const USER_KEY = "aurex_user";

/* ───────────────────────── API-backed provider ─────────────────────────
   Active when VITE_API_URL is set. Mirrors orders into the `orders` state,
   which the existing effect persists to localStorage — so Account/Track/
   OrderSuccess (which read via utils/orders.js) keep working unchanged. */
function ApiAuthProvider({ children }) {
  const { notify } = useNotification();
  const [user, setUser] = useState(() => read(USER_KEY, null));
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState(() => read(ORDERS_KEY, []));

  // Persist orders so the sync localStorage readers (utils/orders.js) see them.
  useEffect(() => write(ORDERS_KEY, orders), [orders]);

  const loadMyOrders = async () => {
    try {
      const res = await api.get("/orders/mine");
      const items = res?.items || res?.data?.items || res?.data || [];
      if (Array.isArray(items)) {
        const normalised = items.map(normaliseOrder);
        setOrders(normalised);
        write(ORDERS_KEY, normalised);
        return normalised;
      }
    } catch { /* not logged in / none */ }
  };

  useEffect(() => {
    if (user) {
      loadMyOrders();
    }
  }, [user]);

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
              const fullUser = {
                ...me,
                isAdmin: me.role === "SUPER_ADMIN" || me.role === "ADMIN" || me.role === "admin" || me.email === ADMIN_EMAIL || !!me.isAdmin,
              };
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
                  const fullUser2 = {
                    ...me2,
                    isAdmin: me2.role === "SUPER_ADMIN" || me2.role === "ADMIN" || me2.role === "admin" || me2.email === ADMIN_EMAIL || !!me2.isAdmin,
                  };
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

  const getErrorMessage = (err, fallback) => {
    if (!err) return fallback;
    if (typeof err === "string") return err;
    if (typeof err.message === "string") return err.message;
    if (typeof err.msg === "string") return err.msg;
    if (typeof err.error === "string") return err.error;
    if (err.error && typeof err.error.message === "string") return err.error.message;
    return fallback;
  };

  const signup = async ({ name, email, password, phone, company }) => {
    try {
      const res = await registerApi({ name, email, password, phone, company });
      const createdUser = res.user;
      const accessToken = res.accessToken;
      const refreshToken = res.refreshToken;
      if (accessToken) {
        setToken(accessToken, refreshToken);
        setAuthToken(accessToken);
      }
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(createdUser?.email || email)); } catch { /* private mode */ }
      const fullUser = {
        ...createdUser,
        isAdmin: createdUser?.isAdmin || createdUser?.role === "SUPER_ADMIN" || createdUser?.role === "ADMIN" || createdUser?.role === "admin" || createdUser?.email === ADMIN_EMAIL,
      };
      setUser(fullUser);
      write(USER_KEY, fullUser);
      await loadMyOrders();
      return { ok: true, user: fullUser };
    } catch (e) {
      return { ok: false, msg: getErrorMessage(e, "Could not create account.") };
    }
  };

  const login = async ({ email, password, remember = true }) => {
    try {
      const res = await loginApi({ email, password });
      const loggedUser = res.user;
      const accessToken = res.accessToken;
      const refreshToken = res.refreshToken;
      if (accessToken) {
        setToken(accessToken, refreshToken);
        setAuthToken(accessToken);
        if (remember) {
          localStorage.setItem(SESSION_KEY, JSON.stringify(email));
        } else {
          sessionStorage.setItem(TEMP_SESSION_KEY, JSON.stringify(email));
        }
      }
      const fullUser = {
        ...loggedUser,
        isAdmin: loggedUser?.isAdmin || loggedUser?.role === "SUPER_ADMIN" || loggedUser?.role === "ADMIN" || loggedUser?.role === "admin" || loggedUser?.email === ADMIN_EMAIL,
      };
      setUser(fullUser);
      write(USER_KEY, fullUser);
      await loadMyOrders();
      return { ok: true, user: fullUser };
    } catch (e) {
      return { ok: false, msg: getErrorMessage(e, "Email or password did not match.") };
    }
  };

  const logout = () => {
    logoutApi().catch(() => {});
    setToken(null, null);
    setAuthToken(null);
    setUser(null);
    setOrders([]);
    try {
      localStorage.removeItem("aurex_access_token");
      localStorage.removeItem("aurex_refresh_token");
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem("aurex_access_token");
      sessionStorage.removeItem(TEMP_SESSION_KEY);
    } catch {}
    notify.info({
      kicker: "ACCOUNT LOGOUT",
      title: "Logged Out Successfully",
      message: "You have been signed out securely. Cart and guest checkout remain active.",
      icon: "login",
      sound: false,
    });
  };

  // Checkout awaits this. Returns the created (normalised) order, or null on failure.
  const placeOrder = async (order) => {
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
  };

  const updateProfile = async (profileData) => {
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
  };

  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "login", onComplete: null });

  const openAuthModal = (options = {}) => {
    const mode = typeof options === "string" ? options : options?.mode || "login";
    const onComplete = typeof options === "object" && typeof options?.onComplete === "function" ? options.onComplete : null;
    setAuthModal({ isOpen: true, mode, onComplete });
  };

  const closeAuthModal = () => {
    setAuthModal((prev) => ({ ...prev, isOpen: false }));
  };

  const myOrders = useMemo(() => orders, [orders]);

  return (
    <AuthCtx.Provider
      value={{
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
        myOrders,
        loadMyOrders,
        refreshOrders: loadMyOrders,
        placeOrder,
        openAuthModal,
        closeAuthModal,
        authModal,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
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
