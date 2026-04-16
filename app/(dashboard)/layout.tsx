"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  { href: "/dashboard",  icon: "⊞",  label: "الرئيسية",    en: "Dashboard",    color: "#f59e0b" },
  { href: "/profile",    icon: "🏪",  label: "نشاطي",       en: "My Business",  color: "#60a5fa" },
  { href: "/billing",    icon: "💳",  label: "الباقة",      en: "Billing",      color: "#22c55e" },
  { href: "/referral",   icon: "🔁",  label: "سوِّق واربح", en: "Refer & Earn", color: "#c084fc" },
  { href: "/help",       icon: "🎫",  label: "المساعدة",    en: "Help",         color: "#f472b6" },
];

const LogoMark = ({ size = 38 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lg1" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fcd34d"/>
        <stop offset="50%" stopColor="#f59e0b"/>
        <stop offset="100%" stopColor="#b45309"/>
      </linearGradient>
      <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.25)"/>
        <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    <rect width="38" height="38" rx="11" fill="url(#lg1)" filter="url(#glow)"/>
    <rect width="38" height="38" rx="11" fill="url(#shine)"/>
    {/* Letter م stylized */}
    <path d="M10 24 C10 24 10 16 14 14 C16 13 18 14 19 16 C20 18 20 21 19 23 C18 25 16 26 14 25"
      stroke="#0a0f1e" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    <path d="M19 16 C20 14 22 13 24 14 C26 15 27 17 27 19 C27 22 25 25 22 26"
      stroke="#0a0f1e" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    <circle cx="22" cy="27" r="1.4" fill="#0a0f1e"/>
    <circle cx="14" cy="26.5" r="1.4" fill="#0a0f1e"/>
  </svg>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <div style={{
        padding: "20px 16px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 11 }}
          onClick={() => setMobileOpen(false)}>
          <LogoMark size={38} />
          <div>
            <div style={{
              fontWeight: 800, fontSize: 17, color: "#f0f4ff",
              lineHeight: 1.15, letterSpacing: "-0.3px",
            }}>موظفي</div>
            <div style={{
              fontSize: 10, lineHeight: 1.2, marginTop: 1,
              background: "linear-gradient(90deg, #f59e0b, #fcd34d)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontWeight: 600, letterSpacing: "0.5px",
            }}>AI Workforce OS</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {NAV.map(item => {
          const active = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`nav-item${active ? " active" : ""}`}
              style={{ color: active ? "#fcd34d" : "rgba(240,244,255,0.5)" }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 17,
                background: active ? `${item.color}18` : "rgba(255,255,255,0.04)",
                border: `1px solid ${active ? item.color + "30" : "rgba(255,255,255,0.05)"}`,
                transition: "all 0.18s ease",
              }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: active ? 600 : 400 }}>{item.label}</div>
                <div style={{ fontSize: 10, opacity: 0.4, lineHeight: 1, marginTop: 1 }}>{item.en}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div style={{
        padding: "12px 10px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        {/* Status indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 12px", borderRadius: 10, marginBottom: 8,
          background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)",
        }}>
          <span className="status-dot-live" />
          <span style={{ fontSize: 12, color: "#4ade80", flex: 1 }}>موظفوك نشطون</span>
          <span style={{ fontSize: 10, color: "rgba(240,244,255,0.25)" }}>24/7</span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="btn-ghost"
          style={{
            width: "100%", padding: "9px 13px",
            display: "flex", alignItems: "center", gap: 10,
            textAlign: "right", fontSize: 13,
          }}>
          <span style={{ fontSize: 15 }}>🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Desktop Sidebar */}
      <aside
        className="desktop-sidebar"
        style={{
          width: "var(--sidebar-w)", flexShrink: 0,
          background: "rgba(8,13,26,0.97)",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column",
          position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 40,
          backdropFilter: "blur(20px)",
        }}>
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.65)",
            zIndex: 48, backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Mobile Sidebar */}
      <aside style={{
        width: "var(--sidebar-w)", flexShrink: 0,
        background: "rgba(8,13,26,0.99)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 49,
        transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.28s cubic-bezier(0.34,1,0.64,1)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, width: 32, height: 32,
              color: "rgba(240,244,255,0.6)", fontSize: 16,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
        </div>
        <NavContent />
      </aside>

      {/* Main content */}
      <main
        className="dashboard-main"
        style={{ flex: 1, marginRight: "var(--sidebar-w)", minHeight: "100vh" }}>

        {/* Top bar */}
        <div style={{
          height: 60, borderBottom: "1px solid rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", padding: "0 24px",
          background: "rgba(6,11,24,0.88)",
          backdropFilter: "blur(16px)",
          position: "sticky", top: 0, zIndex: 30,
          justifyContent: "space-between",
        }}>
          <button
            onClick={() => setMobileOpen(true)}
            className="mobile-menu-btn"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "7px 12px",
              color: "rgba(240,244,255,0.7)",
              cursor: "pointer", fontSize: 17, display: "none",
            }}>☰</button>

          <div style={{ flex: 1 }} />

          {/* Top-right status */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="status-dot-live" />
            <span style={{ fontSize: 12, color: "rgba(240,244,255,0.35)", fontWeight: 500 }}>
              نشط
            </span>
          </div>
        </div>

        <div style={{ padding: "28px 24px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
