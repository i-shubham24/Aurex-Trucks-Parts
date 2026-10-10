const NEW_KEY = "aurex_orders";
const LEGACY_KEY = "aurex-orders";

export const ORDER_STATUSES = [
  "Pending payment",
  "Confirmed",
  "Packed",
  "Dispatched",
  "Delivered",
  "Cancelled",
  "Payment failed",
];

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
  "Pending payment": 0,
  "Order placed": 0,
  "Confirmed": 1,
  "Packed in Campbellfield VIC": 1,
  "Packed": 2,
  "Dispatched": 3,
  "Courier booked": 3,
  "In transit": 3,
  "Delivered": 4,
  "Cancelled": 1,
  "Payment failed": 1,
};

export function isFailedOrder(order) {
  const isCardUnpaid =
    /card/i.test(order?.payment || "") &&
    order?.paymentStatus !== "PAID" &&
    order?.paymentStatus !== "AUTHORIZED";
  return (
    order?.status === "Cancelled" ||
    order?.status === "Payment failed" ||
    order?.paymentStatus === "CANCELLED" ||
    order?.paymentStatus === "FAILED" ||
    isCardUnpaid
  );
}

/* The timeline only ever reflects the status staff have set. An order we can't
   place on it (unknown label) stays at "Order placed" rather than guessing. */
export function orderStatus(order) {
  const steps = ["Order placed", "Confirmed", "Packed", "Dispatched", "Delivered"];
  const isFailed = isFailedOrder(order);
  const rawStatus = order?.status || order?.orderStatus || "";
  const known = Object.prototype.hasOwnProperty.call(STATUS_STEP, rawStatus);
  const isPaid = order?.paymentStatus === "PAID" || order?.paymentStatus === "AUTHORIZED";
  const defaultIdx = isPaid ? 1 : 0;
  return {
    steps,
    idx: known ? STATUS_STEP[rawStatus] : defaultIdx,
    live: Boolean(known),
    cancelled: isFailed,
    failed: isFailed,
  };
}
