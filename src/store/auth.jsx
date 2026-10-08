import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNotification } from "./notification";
import { api, API_ON, setToken, tryRefresh, normaliseOrder } from "../lib/api";
import { loginApi, registerApi, getMeApi, logoutApi } from "../api/endpoints/auth.api";
import { setAuthToken } from "../api/client";

const AuthCtx = createContext(null);
const USERS_KEY = "aurex_users";
const SESSION_KEY = "aurex_session";
const ORDERS_KEY = "aurex_orders";

export const ADMIN_EMAIL = "admin@aurex.com.au";
const ADMIN_PASS = "Admin123!";

const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
const TEMP_SESSION_KEY = "aurex_session_temp";
const readTemp = () => { try { const v = sessionStorage.getItem(TEMP_SESSION_KEY); return v ? JSON.parse(v) : null; } catch { return null; } };

function ensureAdmin() {
  const users = read(USERS_KEY, []);
  const i = users.findIndex((u) => u.email === ADMIN_EMAIL);
  const seed = { name: "Store Admin", email: ADMIN_EMAIL, password: ADMIN_PASS, phone: "+61 414 730 467", company: "Aurex HQ", createdAt: new Date().toISOString(), role: "admin" };
  if (i === -1) users.push(seed);
  else users[i] = { ...users[i], password: ADMIN_PASS, role: "admin" };
  write(USERS_KEY, users);
  return users;
}

/* ───────────────────────── API-backed provider ─────────────────────────
   Active when VITE_API_URL is set. Mirrors orders into the `orders` state,
   which the existing effect persists to localStorage — so Account/Track/
   OrderSuccess (which read via utils/orders.js) keep working unchanged. */
function ApiAuthProvider({ children }) {
  const { notify } = useNotification();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState(() => read(ORDERS_KEY, []));

  // Persist orders so the sync localStorage readers (utils/orders.js) see them.
  useEffect(() => write(ORDERS_KEY, orders), [orders]);

  const loadMyOrders = async () => {
    try {
      const res = await api.get("/orders/mine");
      const items = res?.items || res?.data?.items || res?.data || [];
      if (Array.isArray(items)) {
        setOrders(items.map(normaliseOrder));
      }
    } catch { /* not logged in / none */ }
  };

  // Restore an existing session on load via stored token or refresh cookie.
  useEffect(() => {
    (async () => {
      try {
        const storedToken = localStorage.getItem("aurex_access_token") || sessionStorage.getItem("aurex_access_token");
        if (storedToken) {
          setToken(storedToken);
          setAuthToken(storedToken);
          const me = await getMeApi();
          if (me) {
            setUser({ ...me, isAdmin: me.role === "SUPER_ADMIN" || me.role === "ADMIN" || me.role === "admin" || me.email === ADMIN_EMAIL || !!me.isAdmin });
            await loadMyOrders();
            return;
          }
        }
      } catch { /* proceed to refresh */ }

      if (await tryRefresh()) {
        try {
          const res = await api.get("/auth/me");
          const me = res?.user || res?.data?.user || res?.data;
          if (me) {
            setUser({ ...me, isAdmin: me.role === "SUPER_ADMIN" || me.role === "ADMIN" || me.role === "admin" || me.email === ADMIN_EMAIL || !!me.isAdmin });
            await loadMyOrders();
          }
        } catch { /* ignore */ }
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
      if (accessToken) {
        setToken(accessToken);
        setAuthToken(accessToken);
      }
      setUser({ ...createdUser, isAdmin: createdUser?.isAdmin || createdUser?.role === "SUPER_ADMIN" || createdUser?.role === "ADMIN" || createdUser?.role === "admin" || createdUser?.email === ADMIN_EMAIL });
      await loadMyOrders();
      return { ok: true, user: createdUser };
    } catch (e) {
      return { ok: false, msg: getErrorMessage(e, "Could not create account.") };
    }
  };

  const login = async ({ email, password, remember = true }) => {
    try {
      const res = await loginApi({ email, password });
      const loggedUser = res.user;
      const accessToken = res.accessToken;
      if (accessToken) {
        setToken(accessToken);
        setAuthToken(accessToken);
        if (remember) {
          localStorage.setItem("aurex_access_token", accessToken);
          localStorage.setItem(SESSION_KEY, JSON.stringify(email));
        } else {
          sessionStorage.setItem("aurex_access_token", accessToken);
          sessionStorage.setItem(TEMP_SESSION_KEY, JSON.stringify(email));
        }
      }
      setUser({ ...loggedUser, isAdmin: loggedUser?.isAdmin || loggedUser?.role === "SUPER_ADMIN" || loggedUser?.role === "ADMIN" || loggedUser?.role === "admin" || loggedUser?.email === ADMIN_EMAIL });
      await loadMyOrders();
      return { ok: true, user: loggedUser };
    } catch (e) {
      return { ok: false, msg: getErrorMessage(e, "Email or password did not match.") };
    }
  };

  const logout = () => {
    logoutApi().catch(() => {});
    setToken(null);
    setAuthToken(null);
    setUser(null);
    setOrders([]);
    try {
      localStorage.removeItem("aurex_access_token");
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
        items: (order.items || []).map((l) => ({ sku: l.sku, qty: l.qty })),
        promoCode: order.promoCode || null,
        shipping: order.shipping,
        payment: order.payment,
        address: order.address,
      };
      const res = await api.post("/orders", payload);
      const created = res.order || res.data?.order || res.data;
      const norm = normaliseOrder(created);
      setOrders((o) => [norm, ...o]);
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

  const myOrders = useMemo(() => orders, [orders]);

  return (
    <AuthCtx.Provider value={{ user, session: user?.email || null, users, setUsers, signup, login, logout, orders, setOrders, myOrders, placeOrder }}>
      {children}
    </AuthCtx.Provider>
  );
}

/* ─────────────────────── localStorage provider (original) ─────────────── */
function LocalAuthProvider({ children }) {
  const { notify } = useNotification();
  const [users, setUsers] = useState(() => ensureAdmin());
  const [session, setSession] = useState(() => read(SESSION_KEY, null) ?? readTemp());
  const [persist, setPersist] = useState(() => read(SESSION_KEY, null) != null);
  const [orders, setOrders] = useState(() => read(ORDERS_KEY, []));

  useEffect(() => write(USERS_KEY, users), [users]);
  useEffect(() => {
    try {
      if (persist) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        sessionStorage.removeItem(TEMP_SESSION_KEY);
      } else {
        sessionStorage.setItem(TEMP_SESSION_KEY, JSON.stringify(session));
        localStorage.removeItem(SESSION_KEY);
      }
    } catch { /* private mode */ }
  }, [session, persist]);
  useEffect(() => write(ORDERS_KEY, orders), [orders]);

  const user = useMemo(() => {
    const u = users.find((x) => x.email === session);
    if (!u) return null;
    return { ...u, isAdmin: u.email === ADMIN_EMAIL || u.role === "admin" };
  }, [users, session]);

  const signup = ({ name, email, password, phone, company }) => {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (users.some((u) => u.email === cleanEmail)) return { ok: false, msg: "An account with this email already exists. Please log in." };
    const nu = { name: String(name || "").trim(), email: cleanEmail, password, phone: phone || "", company: company || "", createdAt: new Date().toISOString(), role: "customer" };
    setUsers((u) => [...u, nu]);
    setPersist(true);
    setSession(cleanEmail);
    return { ok: true };
  };

  const login = ({ email, password, remember = true }) => {
    const cleanEmail = String(email || "").trim().toLowerCase().slice(0, 120);
    try {
      const raw = localStorage.getItem("aurex_login_attempts");
      const att = raw ? JSON.parse(raw) : {};
      const rec = att[cleanEmail];
      if (rec && rec.lockedUntil && Date.now() < rec.lockedUntil) {
        const s = Math.ceil((rec.lockedUntil - Date.now()) / 1000);
        return { ok: false, msg: `Too many attempts. Try again in ${s} seconds.` };
      }
    } catch { /* private mode */ }
    const fail = () => {
      try {
        const raw = localStorage.getItem("aurex_login_attempts");
        const att = raw ? JSON.parse(raw) : {};
        const rec = att[cleanEmail] || { fails: 0 };
        rec.fails += 1;
        if (rec.fails >= 5) { rec.lockedUntil = Date.now() + 60000; rec.fails = 0; }
        att[cleanEmail] = rec;
        localStorage.setItem("aurex_login_attempts", JSON.stringify(att));
      } catch { /* private mode */ }
    };
    const pass = () => {
      try {
        const raw = localStorage.getItem("aurex_login_attempts");
        const att = raw ? JSON.parse(raw) : {};
        delete att[cleanEmail];
        localStorage.setItem("aurex_login_attempts", JSON.stringify(att));
      } catch { /* private mode */ }
    };
    let f = users.find((u) => u.email === cleanEmail && u.password === password);
    if (!f) {
      try {
        const raw = localStorage.getItem(USERS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr)) {
          const hit = arr.find((u) => u.email === cleanEmail && u.password === password);
          if (hit) {
            setUsers(arr);
            setPersist(remember !== false);
            setSession(cleanEmail);
            pass();
            return { ok: true };
          }
        }
      } catch { /* private mode */ }
      fail();
      return { ok: false, msg: "Email or password did not match. Try again or create an account." };
    }
    setPersist(remember !== false);
    setSession(cleanEmail);
    pass();
    return { ok: true };
  };

  const logout = () => {
    setSession(null);
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(TEMP_SESSION_KEY);
    } catch { /* private mode */ }
    notify.info({
      kicker: "ACCOUNT LOGOUT",
      title: "Logged Out Successfully",
      message: "You have been signed out securely. Cart and guest checkout remain active.",
      icon: "login",
      sound: false,
    });
  };

  const placeOrder = (order) => {
    const id = "AUX-" + Math.floor(1000 + Math.random() * 9000);
    const full = { ...order, id, email: session, placedAt: new Date().toISOString(), status: "Packed in Campbellfield VIC" };
    setOrders((o) => [full, ...o]);
    return full;
  };

  const myOrders = useMemo(() => orders.filter((o) => o.email === session), [orders, session]);

  return <AuthCtx.Provider value={{ user, session, users, setUsers, signup, login, logout, orders, setOrders, myOrders, placeOrder }}>{children}</AuthCtx.Provider>;
}

export function AuthProvider({ children }) {
  return API_ON ? <ApiAuthProvider>{children}</ApiAuthProvider> : <LocalAuthProvider>{children}</LocalAuthProvider>;
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
