"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

export default function AdminNavClient({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
      {items.map(item => {
        const active = item.href === "/admin"
          ? pathname === "/admin"
          : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 9,
            background: active ? "rgba(239,68,68,0.1)" : "transparent",
            border: active ? "1px solid rgba(239,68,68,0.2)" : "1px solid transparent",
            color: active ? "#f87171" : "rgba(248,250,252,0.55)",
            textDecoration: "none", fontSize: 14,
            fontWeight: active ? 600 : 400,
            transition: "all 0.15s ease",
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
