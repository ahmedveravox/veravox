import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import AdminNavClient from "./nav-client";

const ADMIN_NAV = [
  { href: "/admin", icon: "⊞", label: "لوحة التحكم" },
  { href: "/admin/messages", icon: "💬", label: "رسائل العملاء" },
  { href: "/admin/clients", icon: "👥", label: "العملاء" },
  { href: "/admin/subscriptions", icon: "💳", label: "الاشتراكات" },
  { href: "/admin/referrals", icon: "🔁", label: "الإحالات" },
  { href: "/admin/tickets", icon: "🎫", label: "الدعم" },
  { href: "/admin/settings", icon: "⚙️", label: "الإعدادات" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#060a14" }}>
      {/* Admin Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        background: "rgba(5,8,20,0.98)",
        borderLeft: "1px solid rgba(239,68,68,0.12)",
        display: "flex", flexDirection: "column",
        position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 40,
      }}>
        {/* Admin Logo */}
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(239,68,68,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #ef4444, #b91c1c)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: "white",
            }}>م</div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#f8fafc" }}>موظفي</span>
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "#f87171",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
            Admin Panel
          </div>
        </div>

        {/* Nav – client component for active state */}
        <AdminNavClient items={ADMIN_NAV} />

        {/* Back to platform */}
        <div style={{ padding: "10px", borderTop: "1px solid rgba(239,68,68,0.08)" }}>
          <Link href="/dashboard" style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "9px 12px", borderRadius: 9,
            color: "rgba(248,250,252,0.35)", textDecoration: "none", fontSize: 13,
            transition: "all 0.15s ease",
          }}>
            ← العودة للمنصة
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginRight: 220, minHeight: "100vh" }}>
        {/* Top bar */}
        <div style={{
          height: 56, borderBottom: "1px solid rgba(239,68,68,0.08)",
          display: "flex", alignItems: "center", padding: "0 24px",
          background: "rgba(6,10,20,0.9)", backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 30,
          justifyContent: "space-between",
        }}>
          <span style={{ fontSize: 13, color: "rgba(248,250,252,0.4)", fontFamily: "monospace" }}>
            موظفي · ADMIN CONSOLE
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }} />
            <span style={{ fontSize: 12, color: "#f87171" }}>Admin Mode</span>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
