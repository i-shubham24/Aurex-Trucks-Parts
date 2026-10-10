import { useState, useEffect, useMemo } from "react";
import { Search, RefreshCw, Loader2, CheckCircle2, Clock, Truck, XCircle, Printer, ExternalLink, AlertCircle } from "lucide-react";
import { formatAUD } from "../../data/products";
import { ORDER_STATUSES } from "../../utils/orders";
import { downloadInvoice } from "../../utils/invoice";
import { AdminTitle, Empty, Modal } from "./AdminLayout";
import { getAdminOrdersApi, updateAdminOrderStatusApi } from "../../api/endpoints/admin.api";
import { useNotification } from "../../store/notification";

const STATUS_FILTERS = [
  "All",
  "Confirmed",
  "Packed",
  "Dispatched",
  "Delivered",
  "Pending payment",
  "Payment failed",
  "Cancelled",
];

export const getCanonicalStatus = (o) => {
  const raw = o.status || o.orderStatus || "";
  if (raw === "Packed in Campbellfield VIC") return "Confirmed";
  if (raw === "Courier booked" || raw === "In transit") return "Dispatched";
  return raw || "Pending payment";
};

export default function Orders() {
  const { notify } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [targetStatus, setTargetStatus] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [note, setNote] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await getAdminOrdersApi();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("[admin-orders] Error loading orders:", err);
      notify.error({
        title: "Could not load orders",
        message: err.message || "Failed to fetch orders from backend.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const statusCounts = useMemo(() => {
    const counts = { All: orders.length };
    STATUS_FILTERS.forEach((s) => {
      if (s !== "All") counts[s] = 0;
    });

    orders.forEach((o) => {
      const canonical = getCanonicalStatus(o);
      counts[canonical] = (counts[canonical] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return orders.filter((o) => {
      const canonical = getCanonicalStatus(o);
      if (statusFilter !== "All" && canonical !== statusFilter) return false;
      if (!needle) return true;

      const itemsStr = (o.items || o.lines || []).map((l) => `${l.sku || ""} ${l.name || ""}`).join(" ");
      const haystack = `${o.id || o.ref || ""} ${o.email || ""} ${o.address?.name || ""} ${itemsStr}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [orders, q, statusFilter]);

  const openManage = (order) => {
    setSelectedOrder(order);
    const raw = order.status || order.orderStatus || "Confirmed";
    const mapped =
      raw === "Packed in Campbellfield VIC"
        ? "Confirmed"
      : raw === "Courier booked" || raw === "In transit"
      ? "Dispatched"
      : raw;
    setTargetStatus(mapped);
    setCarrier(order.shipping?.carrier || "");
    setTrackingNumber(order.shipping?.trackingNumber || "");
    setNote("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const orderRef = selectedOrder.id || selectedOrder.ref || selectedOrder.orderNumber;
      const updated = await updateAdminOrderStatusApi(orderRef, {
        status: targetStatus,
        carrier,
        trackingNumber,
        note,
      });

      setOrders((prev) =>
        prev.map((o) => ((o.id || o.ref) === orderRef ? { ...o, ...updated, status: targetStatus, orderStatus: targetStatus } : o))
      );
      setSelectedOrder((prev) => (prev ? { ...prev, ...updated, status: targetStatus, orderStatus: targetStatus } : null));

      notify.success({
        title: "Order Fulfilment Updated",
        message: `Order #${orderRef} marked as "${targetStatus}".`,
      });
      setSelectedOrder(null);
    } catch (err) {
      console.error("[admin-orders] Update error:", err);
      notify.error({
        title: "Update Failed",
        message: err.message || "Could not update order status.",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <AdminTitle
        kicker="Sales & Fulfilment"
        title={`Customer Orders (${orders.length})`}
        right={
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-line-dark bg-white px-3.5 py-2 text-xs font-bold text-steel hover:border-navy hover:text-navy disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-navy" : ""} />
            <span>Refresh</span>
          </button>
        }
      />

      {/* Status Filter Pills & Search Toolbar */}
      <div className="mb-5 space-y-3">
        {/* Horizontal scrollable Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((s) => {
            const count = statusCounts[s] || 0;
            const isSelected = statusFilter === s;

            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-navy text-white shadow-xs ring-1 ring-navy"
                    : "border border-line-dark bg-white text-steel hover:border-navy hover:text-ink"
                }`}
              >
                <span>{s === "All" ? "All Orders" : s}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-mist text-steel"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input Bar + Counter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={15} className="absolute left-3 top-2.5 text-steel" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by Order ID, Customer Name, Email, SKU…"
              className="h-10 w-full rounded-lg border border-line-dark bg-white pl-9 pr-3 text-xs outline-none focus:border-navy"
            />
          </div>
          <span className="font-mono text-xs text-faint">
            Showing {filtered.length} of {orders.length} orders
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center gap-2 rounded-2xl border border-line bg-white p-12 text-sm font-semibold text-steel">
          <Loader2 className="animate-spin text-navy" size={20} />
          <span>Retrieving sales orders…</span>
        </div>
      ) : filtered.length === 0 ? (
        <Empty text="No customer orders match this filter." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-mist text-[11px] font-extrabold uppercase tracking-wider text-steel">
                  <th className="px-5 py-3">Order Number</th>
                  <th className="px-5 py-3">Customer & Address</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Total Amount</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-[13px]">
                {filtered.map((o) => {
                  const id = o.id || o.ref || o.orderNumber;
                  const isPaid = /paid/i.test(o.paymentStatus || "");
                  const isFailed = /cancel|fail/i.test(o.paymentStatus || o.status || "");
                  const items = o.items || o.lines || [];
                  return (
                    <tr key={id} className="hover:bg-mist/40 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-navy">
                        {id}
                        <span className="block font-sans text-[11px] font-normal text-steel">
                          {items.length} {items.length === 1 ? "line item" : "line items"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="block font-semibold text-ink">{o.address?.name || "Customer"}</span>
                        <span className="block font-mono text-[11px] text-steel truncate max-w-[200px]">{o.email || "—"}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-steel">
                        {new Date(o.placedAt).toLocaleString("en-AU", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-5 py-3.5 tabular font-bold text-ink">
                        {formatAUD(o.total)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                            isPaid
                              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                              : isFailed
                              ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                              : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                          }`}
                        >
                          {isPaid ? "PAID" : isFailed ? "FAILED" : "PENDING"} · {o.payment || "Card"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold ${
                            isFailed
                              ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                              : isPaid
                              ? "bg-blue-50 text-navy ring-1 ring-blue-200"
                              : "bg-gold/20 text-ink ring-1 ring-gold/40"
                          }`}
                        >
                          {getCanonicalStatus(o)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openManage(o)}
                          className="rounded-lg bg-mist px-3 py-1.5 text-xs font-bold text-navy hover:bg-navy hover:text-white transition"
                        >
                          Manage →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail & Fulfilment Modal */}
      {selectedOrder && (() => {
        const rawCurrent = selectedOrder.status || selectedOrder.orderStatus || "Confirmed";
        const currentStatus = rawCurrent === "Packed in Campbellfield VIC" ? "Confirmed" : rawCurrent;
        const statusPillBg =
          currentStatus === "Confirmed" ? "bg-blue-50 text-blue-800 border-blue-200" :
          currentStatus === "Packed" ? "bg-amber-50 text-amber-800 border-amber-200" :
          currentStatus === "Dispatched" ? "bg-purple-50 text-purple-800 border-purple-200" :
          currentStatus === "Delivered" ? "bg-green-50 text-green-800 border-green-200" :
          currentStatus === "Pending payment" ? "bg-yellow-50 text-yellow-800 border-yellow-200" :
          "bg-red-50 text-red-800 border-red-200";

        return (
          <Modal close={() => setSelectedOrder(null)} wide>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-faint">Order Invoice</p>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide border ${statusPillBg}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                    Current Status: {currentStatus}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-navy font-mono mt-1">
                  {selectedOrder.id || selectedOrder.ref}
                </h2>
                <p className="text-xs text-steel mt-0.5">
                  Placed on {new Date(selectedOrder.placedAt).toLocaleString("en-AU")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <div>
                  <span className="tabular text-xl font-extrabold text-ink">{formatAUD(selectedOrder.total)}</span>
                  <p className="text-xs text-steel font-bold">{selectedOrder.payment || "Card"} · {selectedOrder.paymentStatus || "PENDING"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadInvoice(selectedOrder)}
                  className="flex items-center gap-1.5 rounded-lg bg-navy px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-ink transition"
                  title="Download and print physical Tax Invoice / Packing Slip to attach to physical order"
                >
                  <Printer size={13} />
                  <span>Download Invoice</span>
                </button>
              </div>
            </div>

          {/* Customer & Address Details */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-xl bg-mist p-4 text-xs">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-faint">Delivery Address</p>
              <p className="mt-1 font-bold text-ink">{selectedOrder.address?.name || "Customer"}</p>
              <p className="text-steel">{selectedOrder.address?.address || ""}</p>
              <p className="text-steel">
                {selectedOrder.address?.suburb} {selectedOrder.address?.state} {selectedOrder.address?.postcode}
              </p>
              <p className="text-steel mt-1 font-mono">{selectedOrder.address?.phone || selectedOrder.phone || ""}</p>
              <p className="text-steel font-mono">{selectedOrder.address?.email || selectedOrder.email || ""}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-faint">Freight Details</p>
              <p className="mt-1 font-bold text-ink">{selectedOrder.shipping || "Standard road freight"}</p>
              {selectedOrder.shipping?.carrier && (
                <p className="text-steel mt-0.5">Carrier: <strong className="text-ink">{selectedOrder.shipping.carrier}</strong></p>
              )}
              {selectedOrder.shipping?.trackingNumber && (
                <p className="text-steel font-mono">Tracking: <strong className="text-ink">{selectedOrder.shipping.trackingNumber}</strong></p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-faint mb-2">Order Line Items</p>
            <div className="divide-y divide-line rounded-xl border border-line overflow-hidden">
              {(selectedOrder.items || selectedOrder.lines || []).map((l, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 text-xs bg-white">
                  <div>
                    <p className="font-bold text-ink">{l.qty || l.quantity || 1} × {l.name}</p>
                    <p className="font-mono text-[11px] text-faint">{l.sku}</p>
                  </div>
                  <span className="tabular font-extrabold text-ink">
                    {formatAUD((l.price ?? l.unitPrice ?? 0) * (l.qty || l.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfilment Status Update Form */}
          <div className="mt-6 rounded-xl border border-line bg-white p-4">
            <h3 className="font-bold text-sm text-ink mb-2">Update Order Status</h3>
            <p className="text-xs text-steel mb-3">
              Changing this status updates warehouse fulfillment, registers inventory tracking, and syncs to the customer tracking portal.
            </p>

            <div className="space-y-3 mb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-steel mb-1.5">Fulfillment Pipeline</p>
                <div className="flex flex-wrap gap-2">
                  {["Confirmed", "Packed", "Dispatched", "Delivered"].map((s) => {
                    const isSelected = targetStatus === s || (s === "Packed" && targetStatus === "Packed in Campbellfield VIC");
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTargetStatus(s)}
                        className={`rounded-lg px-4 py-2 text-xs font-extrabold transition-all ${
                          isSelected
                            ? "bg-navy text-white shadow-sm ring-2 ring-navy/30"
                            : "border border-line-dark bg-white text-steel hover:border-navy hover:text-navy"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-line">
                <p className="text-[11px] font-bold uppercase tracking-wider text-steel mb-1.5">Exception / Hold</p>
                <div className="flex flex-wrap gap-2">
                  {["Pending payment", "Cancelled", "Payment failed"].map((s) => {
                    const isSelected = targetStatus === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setTargetStatus(s)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-red-700 text-white shadow-sm"
                            : "border border-line-dark bg-white text-steel hover:border-red-600 hover:text-red-600"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mt-3">
              <div>
                <label className="block text-[11px] font-bold text-steel mb-1">Carrier Name (Optional)</label>
                <input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="e.g. TNT Express, Toll, AusPost"
                  className="h-9 w-full rounded-md border border-line-dark bg-white px-3 text-xs outline-none focus:border-navy"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-steel mb-1">Consignment / Tracking # (Optional)</label>
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TRK-9832749"
                  className="h-9 w-full rounded-md border border-line-dark bg-white px-3 text-xs font-mono outline-none focus:border-navy"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={() => downloadInvoice(selectedOrder)}
                className="flex items-center gap-1.5 rounded-lg border border-line-dark bg-mist px-3.5 py-2 text-xs font-bold text-navy hover:bg-navy hover:text-white transition"
              >
                <Printer size={13} />
                <span>Download Physical Invoice</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg border border-line-dark px-4 py-2 text-xs font-bold text-steel hover:bg-mist"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleUpdateStatus}
                  className="flex items-center gap-1.5 rounded-lg bg-gold px-5 py-2 text-xs font-extrabold text-ink hover:bg-navy hover:text-white transition disabled:opacity-50"
                >
                  {updating && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Status Change</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      );
    })()}
    </div>
  );
}
