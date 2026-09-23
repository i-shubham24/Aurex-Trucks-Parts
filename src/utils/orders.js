const KEY = "aurex-orders";

export function listOrders() {
  try {
    const a = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(a) ? a : [];
  } catch { return []; }
}

export function saveOrder(order) {
  const all = listOrders();
  all.unshift(order);
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* private mode */ }
  return order;
}

export function findOrder(id) {
  const needle = String(id || "").trim().toUpperCase();
  return listOrders().find((o) => o.id.toUpperCase() === needle) || null;
}

export function makeId() {
  return "AX-" + Math.floor(100000 + Math.random() * 900000);
}

/* Demo timeline derived from order age. */
export function orderStatus(order) {
  const ageHrs = (Date.now() - new Date(order.placedAt).getTime()) / 36e5;
  const steps = ["Order placed", "Confirmed", "Dispatched", "Delivered"];
  const idx = ageHrs < 4 ? 1 : ageHrs < 30 ? 2 : 3;
  return { steps, idx };
}
