"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard", icon: "⊞", label: "الرئيسية" },
  { href: "/profile", icon: "🏪", label: "نشاطي" },
  { href: "/billing", icon: "💳", label: "الباقة" },
  { href: "/referral", icon: "🔁", label: "سوِّق واربح" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0f1e" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: "rgba(15,23,42,0.95)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        position: "fixed", right: 0, top: 0, bottom: 0,
        zIndex: 40,
        transform: sidebarOpen ? "translateX(0)" : undefined,
        transition: "transform 0.25s ease",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 16, color: "#0a0f1e",
            }}>V</div>
            <span style={{ fontWeight: 800, fontSize: 17, color: "#f8fafc" }}>Veravox</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "11px 14px", borderRadius: 10,
                background: active ? "rgba(245,158,11,0.12)" : "transparent",
                border: active ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent",
                color: active ? "#fcd34d" : "rgba(248,250,252,0.55)",
                textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
                transition: "all 0.15s ease",
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              background: "transparent", border: "1px solid rgba(255,255,255,0.06)",
              color: "rgba(248,250,252,0.4)", fontSize: 14, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit",
            }}>
            <span>🚪</span> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{
        flex: 1, marginRight: 240,
        minHeight: "100vh",
        background: "#0a0f1e",
      }}>
        {/* Top bar */}
        <div style={{
          height: 60, borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", padding: "0 28px",
          background: "rgba(10,15,30,0.8)", backdropFilter: "blur(10px)",
          position: "sticky", top: 0, zIndex: 30,
        }}>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: "#22c55e",
              boxShadow: "0 0 8px #22c55e",
            }} />
            <span style={{ fontSize: 13, color: "rgba(248,250,252,0.5)" }}>موظفوك نشطون</span>
          </div>
        </div>

        <div style={{ padding: "28px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
