import { useState, useEffect } from "react";
import { useAuth } from "../../store/auth";
import { AdminTitle, Empty, td, th } from "./AdminLayout";
import { api, API_ON } from "../../lib/api";

export default function Customers() {
  const { users: localUsers, setUsers } = useAuth();
  const [customers, setCustomers] = useState(localUsers);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (API_ON) {
      setLoading(true);
      api.get("/admin/customers")
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
  const list = customers.filter((u) => !query || `${u.name} ${u.email} ${u.company || ""}`.toLowerCase().includes(query));
  const del = (email) => {
    if (!window.confirm(`Delete ${email}?`)) return;
    setCustomers((all) => all.filter((u) => u.email !== email || u.role === "admin"));
    setUsers((all) => all.filter((u) => u.email !== email || u.role === "admin"));
  };
  return (
    <div>
      <AdminTitle kicker="Sales" title={`Customers (${customers.length})`} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, company…"
        className="mb-3 h-11 w-full rounded-md border border-line-dark bg-white px-3 text-sm outline-none placeholder:text-faint focus:border-gold" />
      {loading && customers.length === 0 ? (
        <p className="text-sm font-semibold text-steel">Loading customer accounts…</p>
      ) : list.length === 0 ? <Empty text="No customers match." /> : (
        <div className="overflow-x-auto border-2 border-ink bg-white">
          <table className="w-full min-w-[680px] border-collapse">
            <thead><tr><th className={th}>Name</th><th className={th}>Email</th><th className={th}>Company</th><th className={th}>Joined</th><th className={th}>Actions</th></tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.email}>
                  <td className={td}><span className="font-bold">{u.name}</span> {u.role === "admin" && <span className="ml-1 bg-ink px-1.5 py-0.5 font-mono text-[10px] font-bold text-gold">ADMIN</span>}</td>
                  <td className={td}>{u.email}</td>
                  <td className={td}>{u.company || "—"}</td>
                  <td className={td}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-AU") : "—"}</td>
                  <td className={td}>{u.role !== "admin" && <button onClick={() => del(u.email)} className="font-bold text-red-600 underline">Delete</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
