import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard – Tayf" };

export default async function AdminDashboard() {
  await requireAdmin();

  const [
    totalUsers,
    activeSubscriptions,
    trialUsers,
    totalConversations,
    totalMessages,
    totalReferrals,
    recentUsers,
    planBreakdown,
  ] = await Promise.all([
    db.user.count({ where: { isAdmin: false } }),
    db.subscription.count({ where: { status: "active" } }),
    db.subscription.count({ where: { status: "trial" } }),
    db.conversation.count(),
    db.message.count(),
    db.referral.count({ where: { status: "completed" } }),
    db.user.findMany({
      where: { isAdmin: false },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        business: { select: { name: true, type: true } },
        subscription: { select: { plan: true, status: true } },
      },
    }),
    db.subscription.groupBy({
      by: ["plan"],
      _count: { plan: true },
    }),
  ]);

  const monthlyRevenue = planBreakdown.reduce((sum, p) => {
    const prices: Record<string, number> = { starter: 199, team: 299, growth: 499, business: 999, trial: 0 };
    return sum + (prices[p.plan] ?? 0) * p._count.plan;
  }, 0);

  const statCards = [
    { label: "إجمالي العملاء", value: totalUsers, icon: "👥", color: "#3b82f6", sub: "مسجلين" },
    { label: "اشتراكات نشطة", value: activeSubscriptions, icon: "✅", color: "#22c55e", sub: "مدفوعة" },
    { label: "في التجربة", value: trialUsers, icon: "⏰", color: "#f59e0b", sub: "trial" },
    { label: "الإيراد الشهري", value: `${monthlyRevenue.toLocaleString()} ريال`, icon: "💰", color: "#f59e0b", sub: "تقديري" },
    { label: "إجمالي المحادثات", value: totalConversations, icon: "💬", color: "#c084fc", sub: "كل المحادثات" },
    { label: "إجمالي الرسائل", value: totalMessages, icon: "📨", color: "#2dd4bf", sub: "كل الرسائل" },
    { label: "إحالات مكتملة", value: totalReferrals, icon: "🔁", color: "#fb923c", sub: "ناجحة" },
  ];

  const planColors: Record<string, string> = {
    trial: "#f59e0b", starter: "#22c55e", team: "#3b82f6", growth: "#f59e0b", business: "#ef4444",
  };
  const planNames: Record<string, string> = {
    trial: "تجريبي", starter: "البداية", team: "الفريق", growth: "النمو", business: "الأعمال",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: "0 0 4px" }}>
          🎛️ لوحة تحكم المدير
        </h1>
        <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 13, margin: 0 }}>
          نظرة شاملة على منصة طيف
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{
            background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "18px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
            </div>
            <div style={{ fontSize: typeof s.value === "string" ? 18 : 26, fontWeight: 800, color: "#f8fafc", marginBottom: 2 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Recent Clients */}
        <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>آخر العملاء المسجلين</h2>
            <Link href="/admin/clients" style={{ fontSize: 12, color: "#f59e0b", textDecoration: "none" }}>عرض الكل</Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["العميل", "النشاط", "الباقة", "الحالة", ""].map(h => (
                  <th key={h} style={{
                    textAlign: "right", fontSize: 11, color: "rgba(248,250,252,0.3)",
                    fontWeight: 500, padding: "0 8px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#f8fafc" }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: "rgba(248,250,252,0.35)" }}>{user.email}</div>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: 12, color: "rgba(248,250,252,0.55)" }}>
                    {user.business?.name ?? "—"}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <span style={{
                      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: `${planColors[user.subscription?.plan ?? "trial"] ?? "#999"}15`,
                      color: planColors[user.subscription?.plan ?? "trial"] ?? "#999",
                      border: `1px solid ${planColors[user.subscription?.plan ?? "trial"] ?? "#999"}30`,
                    }}>
                      {planNames[user.subscription?.plan ?? "trial"] ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <span style={{
                      padding: "2px 10px", borderRadius: 20, fontSize: 11,
                      background: user.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                      color: user.status === "active" ? "#4ade80" : "#f87171",
                      border: user.status === "active" ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
                    }}>
                      {user.status === "active" ? "نشط" : "موقوف"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <Link href={`/admin/clients/${user.id}`} style={{
                      fontSize: 11, color: "#f59e0b", textDecoration: "none",
                      padding: "3px 10px", borderRadius: 6,
                      border: "1px solid rgba(245,158,11,0.25)",
                    }}>عرض</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Plan breakdown */}
        <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "20px" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>توزيع الباقات</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {planBreakdown.map(p => {
              const color = planColors[p.plan] ?? "#999";
              const pct = totalUsers > 0 ? Math.round((p._count.plan / (totalUsers + activeSubscriptions + trialUsers || 1)) * 100) : 0;
              return (
                <div key={p.plan}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "rgba(248,250,252,0.7)" }}>{planNames[p.plan] ?? p.plan}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{p._count.plan}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      background: `linear-gradient(90deg, ${color}, ${color}80)`,
                      width: `${Math.max(pct, 5)}%`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick actions */}
          <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 18 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 13, color: "rgba(248,250,252,0.5)", fontWeight: 500 }}>إجراءات سريعة</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "إضافة عميل جديد", href: "/register", icon: "➕" },
                { label: "تصدير بيانات العملاء", href: "/api/admin/export", icon: "📊" },
                { label: "إرسال إشعار عام", href: "/admin/settings", icon: "📢" },
              ].map(a => (
                <Link key={a.href} href={a.href} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 12px", borderRadius: 9,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                  color: "rgba(248,250,252,0.6)", textDecoration: "none", fontSize: 13,
                  transition: "all 0.15s ease",
                }}>
                  <span>{a.icon}</span> {a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
