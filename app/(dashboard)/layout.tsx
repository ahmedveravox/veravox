"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard", icon: "⊞", label: "الرئيسية", en: "Dashboard" },
  { href: "/profile", icon: "🏪", label: "نشاطي", en: "My Business" },
  { href: "/billing", icon: "💳", label: "الباقة", en: "Billing" },
  { href: "/referral", icon: "🔁", label: "سوِّق واربح", en: "Refer & Earn" },
  { href: "/help", icon: "🎫", label: "المساعدة", en: "Help & Support" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }} onClick={() => setMobileOpen(false)}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 18, color: "#0a0f1e",
          }}>ط</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#f8fafc", lineHeight: 1.1 }}>طيف</div>
            <div style={{ fontSize: 10, color: "rgba(245,158,11,0.6)", lineHeight: 1 }}>Tayf · AI Workforce</div>
          </div>
        </Link>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 13px", borderRadius: 10,
              background: active ? "rgba(245,158,11,0.1)" : "transparent",
              border: active ? "1px solid rgba(245,158,11,0.18)" : "1px solid transparent",
              color: active ? "#fcd34d" : "rgba(248,250,252,0.5)",
              textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
              transition: "all 0.15s ease",
            }}>
              <span style={{ fontSize: 17 }}>{item.icon}</span>
              <div>
                <div>{item.label}</div>
                <div style={{ fontSize: 10, opacity: 0.5, lineHeight: 1 }}>{item.en}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <button onClick={() => signOut({ callbackUrl: "/" })} style={{
          width: "100%", padding: "10px 13px", borderRadius: 10,
          background: "transparent", border: "1px solid rgba(255,255,255,0.06)",
          color: "rgba(248,250,252,0.35)", fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 10, fontFamily: "inherit",
          textAlign: "right",
        }}>
          <span>🚪</span> تسجيل الخروج
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0f1e" }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 230, flexShrink: 0,
        background: "rgba(12,18,36,0.98)",
        borderLeft: "1px solid rgba(255,255,255,0.05)",
        display: "flex", flexDirection: "column",
        position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 40,
        // Hide on mobile
        visibility: "visible",
      }} className="desktop-sidebar">
        <NavContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            zIndex: 48, backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* Mobile sidebar */}
      <aside style={{
        width: 230, flexShrink: 0,
        background: "rgba(12,18,36,0.99)",
        borderLeft: "1px solid rgba(255,255,255,0.05)",
        display: "flex", flexDirection: "column",
        position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 49,
        transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s ease",
      }} className="mobile-sidebar">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={() => setMobileOpen(false)} style={{
            background: "transparent", border: "none", color: "rgba(248,250,252,0.5)",
            fontSize: 20, cursor: "pointer", padding: 0,
          }}>✕</button>
        </div>
        <NavContent />
      </aside>

      {/* Main */}
      <main style={{ flex: 1, marginRight: 230, minHeight: "100vh" }} className="dashboard-main">
        {/* Top bar */}
        <div style={{
          height: 58, borderBottom: "1px solid rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", padding: "0 22px",
          background: "rgba(10,15,30,0.85)", backdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 30,
          justifyContent: "space-between",
        }}>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="mobile-menu-btn"
            style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "6px 10px", color: "rgba(248,250,252,0.6)",
              cursor: "pointer", fontSize: 16, display: "none",
            }}
          >☰</button>

          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            <span style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>موظفوك نشطون</span>
          </div>
        </div>

        <div style={{ padding: "24px 22px" }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .dashboard-main { margin-right: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
