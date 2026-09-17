import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthCtx = createContext(null);
const USERS_KEY = "aurex_users";
const SESSION_KEY = "aurex_session";
const ORDERS_KEY = "aurex_orders";

const read = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* noop */ } };

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(() => read(USERS_KEY, []));
  const [session, setSession] = useState(() => read(SESSION_KEY, null));
  const [orders, setOrders] = useState(() => read(ORDERS_KEY, []));

  useEffect(() => write(USERS_KEY, users), [users]);
  useEffect(() => write(SESSION_KEY, session), [session]);
  useEffect(() => write(ORDERS_KEY, orders), [orders]);

  const user = useMemo(() => {
    const u = users.find((u) => u.email === session);
    if (!u) return null;
    return { ...u, isAdmin: u.email === "admin@aurex.com.au" || u.role === "admin" };
  }, [users, session]);

  const signup = ({ name, email, password, phone, company }) => {
    const clean = email.trim().toLowerCase();
    if (users.some((u) => u.email === clean)) return { ok: false, msg: "An account with this email already exists. Please log in." };
    const nu = { name: name.trim(), email: clean, password, phone: phone || "", company: company || "", createdAt: new Date().toISOString(), role: "customer" };
    setUsers((u) => [...u, nu]);
    setSession(clean);
    return { ok: true };
  };
  const login = ({ email, password }) => {
    const clean = email.trim().toLowerCase();
    // NOTE: demo-only auth, credentials live in this browser's localStorage.
    // Production must move to a real backend with hashed passwords and sessions.
    // The admin account is seeded by AdminLayout (ensureAdmin), not here.
    const f = users.find((u) => u.email === clean && u.password === password);
    if (!f) return { ok: false, msg: "Email or password did not match. Try again or create an account." };
    setSession(clean);
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

  return <AuthCtx.Provider value={{ user, session, users, signup, login, logout, orders, myOrders, placeOrder }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
