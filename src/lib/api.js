/**
 * Storefront ↔ backend API client.
 *
 * Feature flag: set VITE_API_URL (e.g. http://localhost:5000/api) to connect
 * the storefront to the truck-parts-api backend. If it is NOT set, API_ON is
 * false and every store falls back to its original localStorage behaviour —
 * so the approved build behaves exactly as before.
 */
export const API_URL = import.meta.env?.VITE_API_URL || "";
export const API_ON = Boolean(API_URL);

const TOKEN_KEY = "aurex_access";

let accessToken = (() => {
  try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
})();

export function setToken(t) {
  accessToken = t || null;
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* private mode */ }
}
export const getToken = () => accessToken;

async function request(path, { method = "GET", body, auth = true, _retry = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(API_URL + path, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // One silent refresh + retry on an expired access token.
  if (res.status === 401 && auth && !_retry) {
    if (await tryRefresh()) return request(path, { method, body, auth, _retry: true });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.details = data.details;
    throw err;
  }
  return data;
}

export async function tryRefresh() {
  try {
    const res = await fetch(API_URL + "/auth/refresh", { method: "POST", credentials: "include" });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.accessToken) { setToken(data.accessToken); return true; }
    return false;
  } catch {
    return false;
  }
}

export const api = {
  get: (p, o) => request(p, { ...o, method: "GET" }),
  post: (p, body, o) => request(p, { ...o, method: "POST", body }),
  put: (p, body, o) => request(p, { ...o, method: "PUT", body }),
  patch: (p, body, o) => request(p, { ...o, method: "PATCH", body }),
  del: (p, o) => request(p, { ...o, method: "DELETE" }),
};

/** Normalise a backend order to the shape the storefront already uses
 *  (it keys everything off `id`, matching the old localStorage orders). */
export function normaliseOrder(o) {
  if (!o) return o;
  return { ...o, id: o.ref || o.id };
}

export default api;
