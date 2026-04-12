"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
  business: { name: string; type: string } | null;
  subscription: { plan: string; status: string; trialEnds: Date; renewsAt: Date } | null;
  _count: { conversations: number };
}

interface Props {
  clients: Client[];
  total: number;
  page: number;
  totalPages: number;
  filters: { q?: string; plan?: string; status?: string };
}

const planColors: Record<string, string> = {
  trial: "#f59e0b", starter: "#22c55e", team: "#3b82f6", growth: "#f59e0b", business: "#ef4444",
};
const planNames: Record<string, string> = {
  trial: "تجريبي", starter: "البداية", team: "الفريق", growth: "النمو", business: "الأعمال",
};

export default function AdminClientsTable({ clients, total, page, totalPages, filters }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(filters.q ?? "");
  const [planFilter, setPlanFilter] = useState(filters.plan ?? "");
  const [statusFilter, setStatusFilter] = useState(filters.status ?? "");

  function applyFilters() {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (planFilter) params.set("plan", planFilter);
    if (statusFilter) params.set("status", statusFilter);
    router.push(`/admin/clients?${params.toString()}`);
  }

  async function toggleStatus(userId: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    await fetch(`/api/admin/clients/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(15,23,42,0.8)", color: "#f8fafc", fontSize: 13, outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", margin: "0 0 4px" }}>👥 إدارة العملاء</h1>
          <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 13, margin: 0 }}>{total} عميل إجمالاً</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: 10, alignItems: "center", marginBottom: 20,
        background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, padding: "14px 16px", flexWrap: "wrap",
      }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث بالاسم، البريد، النشاط..."
          style={{ ...inputStyle, minWidth: 220 }}
          onKeyDown={e => e.key === "Enter" && applyFilters()}
        />
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} style={inputStyle}>
          <option value="">كل الباقات</option>
          <option value="trial">تجريبي</option>
          <option value="starter">البداية</option>
          <option value="team">الفريق</option>
          <option value="growth">النمو</option>
          <option value="business">الأعمال</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={inputStyle}>
          <option value="">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="suspended">موقوف</option>
        </select>
        <button onClick={applyFilters} style={{
          padding: "8px 18px", borderRadius: 8, border: "none",
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "#0a0f1e", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
        }}>بحث</button>
        {(search || planFilter || statusFilter) && (
          <button onClick={() => { setSearch(""); setPlanFilter(""); setStatusFilter(""); router.push("/admin/clients"); }} style={{
            padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent", color: "rgba(248,250,252,0.5)", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
          }}>مسح</button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
              {["العميل", "النشاط التجاري", "الباقة", "المحادثات", "تاريخ الانضمام", "الحالة", "إجراءات"].map(h => (
                <th key={h} style={{
                  textAlign: "right", fontSize: 11, color: "rgba(248,250,252,0.3)",
                  fontWeight: 500, padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} style={{ transition: "background 0.1s ease" }}>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#f8fafc" }}>{client.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(248,250,252,0.35)" }}>{client.email}</div>
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ fontSize: 13, color: "rgba(248,250,252,0.65)" }}>{client.business?.name ?? "—"}</div>
                  <div style={{ fontSize: 11, color: "rgba(248,250,252,0.3)" }}>{client.business?.type ?? ""}</div>
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <span style={{
                    padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: `${planColors[client.subscription?.plan ?? "trial"]}15`,
                    color: planColors[client.subscription?.plan ?? "trial"] ?? "#999",
                    border: `1px solid ${planColors[client.subscription?.plan ?? "trial"] ?? "#999"}30`,
                  }}>
                    {planNames[client.subscription?.plan ?? "trial"] ?? "—"}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", textAlign: "center", fontSize: 13, color: "rgba(248,250,252,0.55)" }}>
                  {client._count.conversations}
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: 12, color: "rgba(248,250,252,0.35)" }}>
                  {new Date(client.createdAt).toLocaleDateString("ar-SA")}
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <span style={{
                    padding: "2px 10px", borderRadius: 20, fontSize: 11,
                    background: client.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                    color: client.status === "active" ? "#4ade80" : "#f87171",
                    border: client.status === "active" ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
                  }}>
                    {client.status === "active" ? "نشط" : "موقوف"}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link href={`/admin/clients/${client.id}`} style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
                      color: "#fcd34d", textDecoration: "none",
                    }}>تفاصيل</Link>
                    <button onClick={() => toggleStatus(client.id, client.status)} style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: client.status === "active" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                      border: client.status === "active" ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(34,197,94,0.25)",
                      color: client.status === "active" ? "#f87171" : "#4ade80",
                      cursor: "pointer", fontFamily: "inherit",
                    }}>
                      {client.status === "active" ? "إيقاف" : "تفعيل"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clients.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "rgba(248,250,252,0.3)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            لا توجد نتائج
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link key={p} href={`/admin/clients?page=${p}${filters.q ? `&q=${filters.q}` : ""}`} style={{
              width: 36, height: 36, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: p === page ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(30,41,59,0.8)",
              border: p === page ? "none" : "1px solid rgba(255,255,255,0.06)",
              color: p === page ? "#0a0f1e" : "rgba(248,250,252,0.6)",
              textDecoration: "none", fontSize: 14, fontWeight: p === page ? 700 : 400,
            }}>{p}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
