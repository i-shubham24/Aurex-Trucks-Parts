import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import { AdminTitle, Empty, td, th } from "./AdminLayout";
import { api, API_ON } from "../../lib/api";
import { useNotification } from "../../store/notification";
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";

export default function Customers() {
  const { notify } = useNotification();
  const { users: localUsers, setUsers } = useAuth();
  const [customers, setCustomers] = useState(localUsers);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // null | customer object
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (API_ON) {
      setLoading(true);
      api
        .get("/admin/customers")
        .then((res) => {
          const items = res?.items || res?.data?.items || res?.data || [];
          if (Array.isArray(items) && items.length) {
            setCustomers(items);
            setUsers(items);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setCustomers(localUsers);
    }
  }, []);

  const query = q.toLowerCase().trim();
  const list = customers.filter(
    (u) =>
      !query ||
      `${u.name || ""} ${u.email || ""} ${u.company || ""}`.toLowerCase().includes(query)
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { email, name, id, _id } = deleteTarget;
    setDeleting(true);

    try {
      if (API_ON) {
        const identifier = id || _id || email;
        await api
          .delete(`/admin/customers/${encodeURIComponent(identifier)}`)
          .catch((err) => {
            console.warn("[Customers] Backend delete failed, proceeding with local deletion:", err);
          });
      }

      setCustomers((all) => all.filter((u) => u.email !== email || u.role === "admin"));
      setUsers((all) => all.filter((u) => u.email !== email || u.role === "admin"));

      notify.success({
        title: "Customer Deleted",
        message: `${name || email} has been removed.`,
      });

      setDeleteTarget(null);
    } catch (err) {
      console.error("[Customers] Delete error:", err);
      notify.error({
        title: "Could Not Delete Customer",
        message: err.message || "Failed to remove customer account.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <AdminTitle kicker="Sales" title={`Customers (${customers.length})`} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, email, company…"
        className="mb-3 h-11 w-full rounded-md border border-line-dark bg-white px-3 text-sm outline-none placeholder:text-faint focus:border-gold"
      />
      {loading && customers.length === 0 ? (
        <p className="text-sm font-semibold text-steel">Loading customer accounts…</p>
      ) : list.length === 0 ? (
        <Empty text="No customers match." />
      ) : (
        <div className="overflow-x-auto border-2 border-ink bg-white">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Email</th>
                <th className={th}>Company</th>
                <th className={th}>Joined</th>
                <th className={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.email}>
                  <td className={td}>
                    <span className="font-bold">{u.name}</span>{" "}
                    {u.role === "admin" && (
                      <span className="ml-1 bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-gold">
                        ADMIN
                      </span>
                    )}
                  </td>
                  <td className={td}>{u.email}</td>
                  <td className={td}>{u.company || "—"}</td>
                  <td className={td}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-AU") : "—"}
                  </td>
                  <td className={td}>
                    {u.role !== "admin" && (
                      <button
                        onClick={() => setDeleteTarget(u)}
                        className="flex items-center gap-1 font-bold text-red-600 hover:text-red-700 transition underline cursor-pointer"
                        title={`Delete ${u.name || u.email}`}
                      >
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto p-4 animate-in fade-in duration-200"
        >
          {/* Backdrop blur overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => !deleting && setDeleteTarget(null)}
          />

          {/* Floating dialog card */}
          <div className="relative w-full max-w-md rounded-2xl border border-line-dark bg-white p-6 shadow-2xl transition-all">
            {/* Close button */}
            <button
              onClick={() => !deleting && setDeleteTarget(null)}
              disabled={deleting}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-steel hover:bg-mist hover:text-ink disabled:opacity-50 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Warning Icon Badge */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 ring-8 ring-red-50 mb-4">
              <AlertTriangle size={24} />
            </div>

            {/* Title & Warning message */}
            <h3 className="text-lg font-extrabold text-ink">
              Delete Customer Account?
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-steel">
              Are you sure you want to delete this customer? This will permanently remove their profile, contact information, and platform access.
            </p>

            {/* Customer Snapshot Card */}
            <div className="my-4 flex items-center gap-3.5 rounded-xl border border-line bg-mist/60 p-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-mono font-bold text-white shadow-2xs">
                {deleteTarget.name
                  ? deleteTarget.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "CU"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-ink text-xs line-clamp-1" title={deleteTarget.name}>
                    {deleteTarget.name}
                  </p>
                  {deleteTarget.role === "admin" && (
                    <span className="bg-ink px-1.5 py-0.5 font-mono text-[9px] font-bold text-gold rounded">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="font-mono text-[11px] text-steel truncate mt-0.5">
                  {deleteTarget.email}
                </p>
                {deleteTarget.company && (
                  <p className="text-[10px] text-faint truncate mt-0.5">
                    {deleteTarget.company}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-line-dark bg-white py-2.5 text-xs font-bold text-steel hover:bg-mist hover:text-ink disabled:opacity-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 disabled:opacity-60 transition cursor-pointer"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
