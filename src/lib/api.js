/**
 * Storefront ↔ backend API client.
 *
 * Feature flag: set VITE_API_URL (e.g. http://localhost:5000/api) to connect
 * the storefront to the truck-parts-api backend. If it is NOT set, API_ON is
 * false and every store falls back to its original localStorage behaviour —
 * so the approved build behaves exactly as before.
 */
export const API_URL =
  import.meta.env?.VITE_API_URL ||
  (import.meta.env?.PROD
    ? '/api/v1'
    : 'http://localhost:5001/api/v1');
export const API_ON = true;

const TOKEN_KEY = "aurex_access_token";
const REFRESH_KEY = "aurex_refresh_token";

let accessToken = (() => {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
})();

export function setToken(t, r) {
  accessToken = t || null;
  try {
    if (t) {
      localStorage.setItem(TOKEN_KEY, t);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    if (r) {
      localStorage.setItem(REFRESH_KEY, r);
    } else if (r === null) {
      localStorage.removeItem(REFRESH_KEY);
    }
  } catch {}
}
export const getToken = () => accessToken;

async function request(path, { method = "GET", body, auth = true, _retry = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  const currentToken = accessToken || (() => {
    try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
  })();
  if (auth && currentToken) headers.Authorization = `Bearer ${currentToken}`;

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
    const errorMsg =
      (typeof data.error === 'string'
        ? data.error
        : data.error?.message) ||
      (typeof data.message === 'string'
        ? data.message
        : `Request failed (${res.status})`);
    const err = new Error(errorMsg);
    err.status = res.status;
    err.details = data.details || data.error?.details;
    throw err;
  }
  return data;
}

export async function tryRefresh() {
  try {
    const refreshToken = (() => {
      try {
        return localStorage.getItem(REFRESH_KEY) || "";
      } catch {
        return "";
      }
    })();

    const res = await fetch(API_URL + "/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(refreshToken ? { refreshToken } : {}),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const newAccess = data.accessToken || data.data?.accessToken;
    const newRefresh = data.refreshToken || data.data?.refreshToken;
    if (newAccess) {
      setToken(newAccess, newRefresh);
      return true;
    }
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
