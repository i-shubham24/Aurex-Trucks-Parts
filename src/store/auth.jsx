import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthCtx = createContext(null);
const USERS_KEY = "aurex_users";
const SESSION_KEY = "aurex_session";
const ORDERS_KEY = "aurex_orders";

export const ADMIN_EMAIL = "admin@aurex.com.au";
const ADMIN_PASS = "Admin123!";

const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

function ensureAdmin() {
  const users = read(USERS_KEY, []);
  const i = users.findIndex((u) => u.email === ADMIN_EMAIL);
  const seed = { name: "Store Admin", email: ADMIN_EMAIL, password: ADMIN_PASS, phone: "03 9000 0000", company: "Aurex HQ", createdAt: new Date().toISOString(), role: "admin" };
  if (i === -1) users.push(seed);
  else users[i] = { ...users[i], password: ADMIN_PASS, role: "admin" };
  write(USERS_KEY, users);
  return users;
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => ensureAdmin());
  const [session, setSession] = useState(() => read(SESSION_KEY, null));
  const [orders, setOrders] = useState(() => read(ORDERS_KEY, []));

  useEffect(() => write(USERS_KEY, users), [users]);
  useEffect(() => write(SESSION_KEY, session), [session]);
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
    setSession(cleanEmail);
    return { ok: true };
  };

  const login = ({ email, password }) => {
    const cleanEmail = String(email || "").trim().toLowerCase().slice(0, 120);
    /* Brute-force throttle: 5 failed attempts locks the address for 60 seconds. */
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
    // Demo-only auth: credentials live in this browser's localStorage.
    let f = users.find((u) => u.email === cleanEmail && u.password === password);
    if (!f) {
      try {
        const raw = localStorage.getItem(USERS_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        if (Array.isArray(arr)) {
          const hit = arr.find((u) => u.email === cleanEmail && u.password === password);
          if (hit) {
            setUsers(arr);
            setSession(cleanEmail);
            pass();
            return { ok: true };
          }
        }
      } catch { /* private mode */ }
      fail();
      return { ok: false, msg: "Email or password did not match. Try again or create an account." };
    }
    setSession(cleanEmail);
    pass();
    return { ok: true };
  };

  const logout = () => setSession(null);

  const placeOrder = (order) => {
    const id = "AUX-" + Math.floor(1000 + Math.random() * 9000);
    const full = { ...order, id, email: session, placedAt: new Date().toISOString(), status: "Packed in Campbellfield VIC" };
    setOrders((o) => [full, ...o]);
    return full;
  };

  const myOrders = useMemo(() => orders.filter((o) => o.email === session), [orders, session]);

  return <AuthCtx.Provider value={{ user, session, users, setUsers, signup, login, logout, orders, setOrders, myOrders, placeOrder }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
