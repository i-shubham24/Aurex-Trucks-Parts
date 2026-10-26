import { getAuthToken, setAuthToken, setRefreshToken, refreshSession } from "../api/client";

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

/* The token lives in one place (api/client.js) so this client and the axios one
   always send the same bearer token, including right after a silent refresh. */
export function setToken(t, r) {
  setAuthToken(t);
  setRefreshToken(r);
}
export const getToken = () => getAuthToken();

async function request(path, { method = "GET", body, auth = true, _retry = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  const currentToken = getAuthToken();
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

/* Shared with the axios client: one in-flight refresh, and a rejected refresh token
   clears the stored session (the auth store hears about it and signs the user out). */
export const tryRefresh = () => refreshSession();

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
  const rawStatus = o.orderStatus || o.status || "";
  const cleanStatus = rawStatus === "Packed in Campbellfield VIC" ? "Packed" : rawStatus;
  const orderId = o.orderNumber || o.ref || o.id;
  return {
    ...o,
    id: orderId,
    ref: orderId,
    orderNumber: orderId,
    status: cleanStatus || o.status || "Pending payment",
    orderStatus: cleanStatus || o.orderStatus || "Pending payment",
  };
}

export default api;
