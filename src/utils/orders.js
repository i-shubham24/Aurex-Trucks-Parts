const NEW_KEY = "aurex_orders";
const LEGACY_KEY = "aurex-orders";

export const ORDER_STATUSES = ["Packed in Campbellfield VIC", "Courier booked", "In transit", "Delivered", "Cancelled"];

function readKey(key) {
  try {
    const a = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(a) ? a : [];
  } catch { return []; }
}

export function listOrders() {
  const fresh = readKey(NEW_KEY);
  const legacy = readKey(LEGACY_KEY).filter((o) => !fresh.some((n) => n.id === o.id));
  return [...fresh, ...legacy];
}

export function saveOrder(order) {
  const all = readKey(NEW_KEY);
  all.unshift(order);
  try { localStorage.setItem(NEW_KEY, JSON.stringify(all)); } catch { /* private mode */ }
  return order;
}

export function findOrder(id) {
  const needle = String(id || "").trim().toUpperCase();
  if (!needle) return null;
  return listOrders().find((o) => String(o.id || "").toUpperCase() === needle) || null;
}

export function makeId() {
  return "AX-" + Math.floor(100000 + Math.random() * 900000);
}

const STATUS_STEP = {
  "Packed in Campbellfield VIC": 1,
  "Courier booked": 2,
  "In transit": 2,
  "Delivered": 3,
  "Cancelled": 1,
};

/* Explicit admin-set status wins; otherwise fall back to age-based demo timeline. */
export function orderStatus(order) {
  const steps = ["Order placed", "Confirmed", "Dispatched", "Delivered"];
  if (order && Object.prototype.hasOwnProperty.call(STATUS_STEP, order.status)) {
    return { steps, idx: STATUS_STEP[order.status], live: true, cancelled: order.status === "Cancelled" };
  }
  const ageHrs = (Date.now() - new Date(order.placedAt).getTime()) / 36e5;
  const idx = ageHrs < 4 ? 1 : ageHrs < 30 ? 2 : 3;
  return { steps, idx, live: false, cancelled: false };
}
