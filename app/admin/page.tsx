import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Admin Dashboard – موظفي" };

const PLAN_PRICES: Record<string, number> = { starter: 199, team: 299, growth: 499, business: 999, trial: 0 };
const PLAN_NAMES: Record<string, string> = { trial: "تجريبي", starter: "البداية", team: "الفريق", growth: "النمو", business: "الأعمال" };
const PLAN_COLORS: Record<string, string> = { trial: "#f59e0b", starter: "#22c55e", team: "#3b82f6", growth: "#f59e0b", business: "#ef4444" };

export default async function AdminDashboard() {
  await requireAdmin();

  const now = new Date();

  const [
    totalUsers,
    activeSubscriptions,
    trialUsers,
    totalConversations,
    totalMessages,
    totalReferrals,
    recentUsers,
    planBreakdown,
    openTickets,
    recentLogs,
    recentAnnouncements,
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
      take: 8,
      include: {
        business: { select: { name: true, type: true } },
        subscription: { select: { plan: true, status: true } },
      },
    }),
    db.subscription.groupBy({ by: ["plan"], _count: { plan: true } }),
    db.supportTicket.count({ where: { status: { in: ["open", "in_progress"] } } }),
    db.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    db.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
  ]);

  // Revenue by month (last 6 months from active subscriptions)
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  const recentSubs = await db.subscription.findMany({
    where: { status: "active", createdAt: { gte: sixMonthsAgo } },
    select: { plan: true, createdAt: true },
  });

  // Build monthly revenue chart data
  const monthLabels: string[] = [];
  const monthRevenue: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleDateString("ar-SA", { month: "short" });
    const revenue = recentSubs
      .filter(s => {
        const sm = new Date(s.createdAt);
        return sm.getMonth() === d.getMonth() && sm.getFullYear() === d.getFullYear();
      })
      .reduce((sum, s) => sum + (PLAN_PRICES[s.plan] ?? 0), 0);
    monthLabels.push(label);
    monthRevenue.push(revenue);
  }
  const maxRevenue = Math.max(...monthRevenue, 1);

  const monthlyRevenue = planBreakdown.reduce((sum, p) =>
    sum + (PLAN_PRICES[p.plan] ?? 0) * p._count.plan, 0);

  const statCards = [
    { label: "إجمالي العملاء", value: totalUsers, icon: "👥", color: "#3b82f6", sub: "مسجلين" },
    { label: "اشتراكات نشطة", value: activeSubscriptions, icon: "✅", color: "#22c55e", sub: "مدفوعة" },
    { label: "في التجربة", value: trialUsers, icon: "⏰", color: "#f59e0b", sub: "trial" },
    { label: "الإيراد الشهري", value: `${monthlyRevenue.toLocaleString()} ر`, icon: "💰", color: "#f59e0b", sub: "تقديري" },
    { label: "المحادثات", value: totalConversations, icon: "💬", color: "#c084fc", sub: "إجمالي" },
    { label: "الرسائل", value: totalMessages, icon: "📨", color: "#2dd4bf", sub: "إجمالي" },
    { label: "إحالات ناجحة", value: totalReferrals, icon: "🔁", color: "#fb923c", sub: "مكتملة" },
    { label: "تذاكر مفتوحة", value: openTickets, icon: "🎫", color: openTickets > 0 ? "#ef4444" : "#22c55e", sub: "بانتظار الرد" },
  ];

  const LOG_ICONS: Record<string, string> = {
    extend_trial: "⏰", ticket_reply: "💬", broadcast: "📢", suspend: "🚫",
    activate: "✅", plan_change: "💳", grant_admin: "👑",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: "0 0 4px" }}>🎛️ لوحة تحكم المدير</h1>
        <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 13, margin: 0 }}>نظرة شاملة على منصة موظفي</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{
            background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
            </div>
            <div style={{ fontSize: typeof s.value === "string" ? 17 : 24, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "rgba(248,250,252,0.5)", fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "rgba(248,250,252,0.25)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Plan Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Revenue Trend Chart */}
        <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>📈 الإيرادات (آخر 6 أشهر)</h2>
            <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>
              {monthlyRevenue.toLocaleString()} ر.س / شهر
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
            {monthRevenue.map((rev, i) => {
              const pct = (rev / maxRevenue) * 100;
              const isLast = i === monthRevenue.length - 1;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                  <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%",
                      height: `${Math.max(pct, 4)}%`,
                      background: isLast
                        ? "linear-gradient(180deg, #f59e0b, #d97706)"
                        : "linear-gradient(180deg, rgba(245,158,11,0.5), rgba(245,158,11,0.15))",
                      borderRadius: "5px 5px 3px 3px",
                      boxShadow: isLast ? "0 0 12px rgba(245,158,11,0.3)" : "none",
                      transition: "height 0.3s ease",
                      position: "relative",
                    }}>
                      {rev > 0 && (
                        <div style={{
                          position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)",
                          fontSize: 10, color: "#f59e0b", fontWeight: 700, whiteSpace: "nowrap",
                        }}>{rev > 0 ? rev.toLocaleString() : ""}</div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(248,250,252,0.4)" }}>{monthLabels[i]}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plan Breakdown */}
        <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "20px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>توزيع الباقات</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {planBreakdown.map(p => {
              const color = PLAN_COLORS[p.plan] ?? "#999";
              const pct = totalUsers > 0 ? Math.round((p._count.plan / totalUsers) * 100) : 0;
              return (
                <div key={p.plan}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "rgba(248,250,252,0.7)" }}>{PLAN_NAMES[p.plan] ?? p.plan}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color }}>{p._count.plan}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
                    <div style={{ height: "100%", borderRadius: 4, width: `${Math.max(pct, 4)}%`, background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16 }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 12, color: "rgba(248,250,252,0.4)", fontWeight: 500 }}>إجراءات سريعة</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { label: "إضافة عميل", href: "/register", icon: "➕" },
                { label: "تصدير CSV", href: "/api/admin/export", icon: "📊" },
                { label: "إرسال إعلان", href: "/admin/broadcast", icon: "📢" },
                { label: "سجل الإجراءات", href: "/admin/logs", icon: "📋" },
              ].map(a => (
                <Link key={a.href} href={a.href} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 8,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                  color: "rgba(248,250,252,0.6)", textDecoration: "none", fontSize: 12,
                }}>
                  <span>{a.icon}</span>{a.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Recent Clients + Logs + Announcements */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        {/* Recent Clients */}
        <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>آخر العملاء</h2>
            <Link href="/admin/clients" style={{ fontSize: 12, color: "#f59e0b", textDecoration: "none" }}>عرض الكل ←</Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["العميل", "النشاط", "الباقة", "الحالة", ""].map(h => (
                  <th key={h} style={{ textAlign: "right", fontSize: 11, color: "rgba(248,250,252,0.3)", fontWeight: 500, padding: "0 6px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id}>
                  <td style={{ padding: "9px 6px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#f8fafc" }}>{user.name}</div>
                    <div style={{ fontSize: 10, color: "rgba(248,250,252,0.3)" }}>{user.email}</div>
                  </td>
                  <td style={{ padding: "9px 6px", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: 12, color: "rgba(248,250,252,0.5)" }}>{user.business?.name ?? "—"}</td>
                  <td style={{ padding: "9px 6px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: `${PLAN_COLORS[user.subscription?.plan ?? "trial"] ?? "#999"}15`,
                      color: PLAN_COLORS[user.subscription?.plan ?? "trial"] ?? "#999",
                    }}>
                      {PLAN_NAMES[user.subscription?.plan ?? "trial"] ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: "9px 6px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 20, fontSize: 11,
                      background: user.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                      color: user.status === "active" ? "#4ade80" : "#f87171",
                    }}>{user.status === "active" ? "نشط" : "موقوف"}</span>
                  </td>
                  <td style={{ padding: "9px 6px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <Link href={`/admin/clients/${user.id}`} style={{ fontSize: 11, color: "#f59e0b", textDecoration: "none", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(245,158,11,0.25)" }}>عرض</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Logs + Announcements */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Recent Logs */}
          <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>📋 سجل الإجراءات</h2>
              <Link href="/admin/logs" style={{ fontSize: 11, color: "#f59e0b", textDecoration: "none" }}>الكل</Link>
            </div>
            {recentLogs.length === 0 ? (
              <div style={{ fontSize: 12, color: "rgba(248,250,252,0.3)", textAlign: "center", padding: "12px" }}>لا توجد إجراءات بعد</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentLogs.map(log => (
                  <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 14, marginTop: 1 }}>{LOG_ICONS[log.action] ?? "⚡"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#f8fafc" }}>{log.details ?? log.action}</div>
                      <div style={{ fontSize: 10, color: "rgba(248,250,252,0.3)" }}>{new Date(log.createdAt).toLocaleString("ar-SA")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>📢 الإعلانات</h2>
              <Link href="/admin/broadcast" style={{ fontSize: 11, color: "#f59e0b", textDecoration: "none" }}>إرسال جديد</Link>
            </div>
            {recentAnnouncements.length === 0 ? (
              <div style={{ fontSize: 12, color: "rgba(248,250,252,0.3)", textAlign: "center", padding: "12px" }}>لا توجد إعلانات</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentAnnouncements.map(a => (
                  <div key={a.id} style={{
                    padding: "10px 12px", borderRadius: 10,
                    background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc", marginBottom: 3 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(248,250,252,0.4)", display: "flex", justifyContent: "space-between" }}>
                      <span>{a.audience === "all" ? "الجميع" : a.audience}</span>
                      <span>{new Date(a.createdAt).toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
