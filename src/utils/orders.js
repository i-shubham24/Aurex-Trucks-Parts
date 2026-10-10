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
  "Packed in Campbellfield VIC": 2,
  "Packed": 2,
  "Dispatched": 3,
  "Courier booked": 3,
  "In transit": 3,
  "Delivered": 4,
  "Cancelled": 1,
  "Payment failed": 1,
};

export function isFailedOrder(order) {
  const status = String(order?.status || order?.orderStatus || "").trim().toLowerCase();
  if (status === "cancelled" || status === "payment failed") return true;
  if (["confirmed", "packed", "dispatched", "delivered"].includes(status)) return false;
  const paymentStatus = String(order?.paymentStatus || "").trim().toUpperCase();
  if (paymentStatus === "CANCELLED" || paymentStatus === "FAILED") return true;
  const isCardUnpaid =
    /card/i.test(order?.payment || "") &&
    paymentStatus !== "PAID" &&
    paymentStatus !== "AUTHORIZED";
  return isCardUnpaid;
}

/* The timeline reflects the status set by staff / API. */
export function orderStatus(order) {
  const steps = ["Order placed", "Confirmed", "Packed", "Dispatched", "Delivered"];
  const rawStatus = order?.status || order?.orderStatus || "";
  const cleanStatus = rawStatus === "Packed in Campbellfield VIC" ? "Packed" : rawStatus;
  const isCancelled = cleanStatus === "Cancelled" || String(order?.paymentStatus || "").toUpperCase() === "CANCELLED";
  const isPaymentFailed = cleanStatus === "Payment failed" || (!isCancelled && String(order?.paymentStatus || "").toUpperCase() === "FAILED");
  const known = Object.prototype.hasOwnProperty.call(STATUS_STEP, cleanStatus);
  const isPaid = order?.paymentStatus === "PAID" || order?.paymentStatus === "AUTHORIZED";
  const defaultIdx = isPaid ? 1 : 0;
  return {
    steps,
    idx: known ? STATUS_STEP[cleanStatus] : defaultIdx,
    live: Boolean(known),
    cancelled: isCancelled,
    failed: isPaymentFailed,
    statusText: cleanStatus || (isCancelled ? "Cancelled" : isPaymentFailed ? "Payment failed" : steps[defaultIdx]),
  };
}
