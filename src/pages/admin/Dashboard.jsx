import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, RefreshCw, ShoppingCart, Package, Users, DollarSign, AlertTriangle, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { formatAUD } from "../../data/products";
import { AdminTitle, Stat, td, th } from "./AdminLayout";
import { getAdminDashboardStatsApi } from "../../api/endpoints/admin.api";
import { useNotification } from "../../store/notification";

export default function Dashboard() {
  const { notify } = useNotification();
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
    tradeCustomers: 0,
    openQuotes: 0,
    lowStockProducts: 0,
    recentOrders: [],
    recentQuotes: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await getAdminDashboardStatsApi();
      setStats(data);
      if (isManual) {
        notify.success({
          title: "Dashboard Refreshed",
          message: "Live sales and catalogue metrics updated.",
        });
      }
    } catch (err) {
      console.error("[admin-dashboard] Error loading stats:", err);
      if (isManual) {
        notify.error({
          title: "Refresh Failed",
          message: err.message || "Could not retrieve live dashboard stats.",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const exportCsv = () => {
    const rows = [
      ["Order ID", "Customer Email", "Placed At", "Total", "Status"],
      ...stats.recentOrders.map((o) => [
        o.id || o.ref,
        o.email || "guest",
        new Date(o.placedAt).toLocaleString("en-AU"),
        o.total,
        o.status || o.orderStatus || "",
      ]),
    ];
    const blob = new Blob([rows.map((r) => r.map(csvCell).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `aurex_orders_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <AdminTitle
        kicker="Executive Overview"
        title="Operations Dashboard"
        right={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadStats(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-lg border border-line-dark bg-white px-3.5 py-2 text-xs font-bold text-steel transition hover:border-navy hover:text-navy disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin text-navy" : ""} />
              <span>{refreshing ? "Updating…" : "Refresh"}</span>
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-xs font-bold text-white transition hover:bg-navy"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <Link
              to="/admin/products"
              className="rounded-lg bg-gold px-4 py-2 text-xs font-bold text-ink transition hover:bg-navy hover:text-white"
            >
              + Add Product
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center gap-2 rounded-2xl border border-line bg-white p-12 text-sm font-semibold text-steel">
          <Loader2 className="animate-spin text-navy" size={20} />
          <span>Loading live management analytics…</span>
        </div>
      ) : (
        <>
          {/* Top Key Metrics */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-line bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-steel">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-faint">Total Revenue</span>
                <span className="rounded-md bg-green-50 p-2 text-green-700"><DollarSign size={16} /></span>
              </div>
              <p className="tabular mt-2 text-3xl font-extrabold text-ink">{formatAUD(stats.revenue)}</p>
              <p className="mt-1 text-xs text-steel">Across all completed orders</p>
            </div>

            <div className="rounded-xl border border-line bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-steel">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-faint">Total Orders</span>
                <span className="rounded-md bg-blue-50 p-2 text-blue-700"><ShoppingCart size={16} /></span>
              </div>
              <p className="tabular mt-2 text-3xl font-extrabold text-ink">{stats.orders}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-steel">
                <Link to="/admin/orders" className="font-bold text-navy underline hover:text-primary">
                  View order pipeline →
                </Link>
              </p>
            </div>

            <div className="rounded-xl border border-line bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-steel">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-faint">Live SKUs</span>
                <span className="rounded-md bg-amber-50 p-2 text-amber-700"><Package size={16} /></span>
              </div>
              <p className="tabular mt-2 text-3xl font-extrabold text-ink">{stats.products}</p>
              <p className="mt-1 text-xs text-steel">
                {stats.lowStockProducts > 0 ? (
                  <span className="flex items-center gap-1 text-amber-700 font-semibold">
                    <AlertTriangle size={12} /> {stats.lowStockProducts} parts low on stock
                  </span>
                ) : (
                  "All published catalog lines"
                )}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-steel">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-faint">Customers</span>
                <span className="rounded-md bg-purple-50 p-2 text-purple-700"><Users size={16} /></span>
              </div>
              <p className="tabular mt-2 text-3xl font-extrabold text-ink">{stats.customers}</p>
              <p className="mt-1 text-xs text-steel">{stats.tradeCustomers} approved trade accounts</p>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="mt-6 rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div>
                <h2 className="text-base font-extrabold text-ink">Recent Customer Orders</h2>
                <p className="text-xs text-steel">Latest incoming orders from the online storefront and trade portal</p>
              </div>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1 text-xs font-bold text-navy hover:underline"
              >
                <span>View all orders</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {stats.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-steel">
                No orders placed yet. Orders created via the storefront checkout will populate here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line bg-mist text-[11px] font-extrabold uppercase tracking-wider text-steel">
                      <th className="px-5 py-3">Order #</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Placed At</th>
                      <th className="px-5 py-3">Total Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-[13px]">
                    {stats.recentOrders.slice(0, 8).map((order) => {
                      const isPaid = /paid/i.test(order.paymentStatus || order.status || "");
                      const isFailed = /cancel|fail/i.test(order.paymentStatus || order.status || "");
                      return (
                        <tr key={order.id || order.ref} className="hover:bg-mist/50 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-bold text-navy">
                            {order.id || order.ref}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="block font-semibold text-ink">{order.address?.name || "Customer"}</span>
                            <span className="block font-mono text-[11px] text-steel truncate max-w-[200px]">{order.email || "—"}</span>
                          </td>
                          <td className="px-5 py-3.5 font-mono text-xs text-steel">
                            {new Date(order.placedAt).toLocaleString("en-AU", { dateStyle: "short", timeStyle: "short" })}
                          </td>
                          <td className="px-5 py-3.5 tabular font-bold text-ink">
                            {formatAUD(order.total)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                                isFailed
                                  ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                                  : isPaid
                                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                  : "bg-gold/20 text-ink ring-1 ring-gold/40"
                              }`}
                            >
                              {order.status === "Packed in Campbellfield VIC"
                                ? "Confirmed"
                                : order.status === "Courier booked" || order.status === "In transit"
                                ? "Dispatched"
                                : order.status || order.orderStatus || "Pending"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              to="/admin/orders"
                              className="rounded-md border border-line-dark px-3 py-1.5 text-xs font-bold text-steel hover:border-navy hover:text-navy"
                            >
                              Manage →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
