import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "الاشتراكات – Admin" };

const PLAN_COLORS: Record<string, string> = {
  trial: "#f59e0b", starter: "#22c55e", team: "#3b82f6",
  growth: "#f59e0b", business: "#ef4444",
};
const PLAN_NAMES: Record<string, string> = {
  trial: "تجريبي", starter: "البداية", team: "الفريق",
  growth: "النمو", business: "الأعمال",
};
const PLAN_PRICES: Record<string, number> = {
  trial: 0, starter: 199, team: 299, growth: 499, business: 999,
};
const STATUS_COLORS: Record<string, [string, string]> = {
  trial: ["rgba(245,158,11,0.12)", "#fcd34d"],
  active: ["rgba(34,197,94,0.12)", "#4ade80"],
  expired: ["rgba(239,68,68,0.12)", "#f87171"],
  suspended: ["rgba(100,116,139,0.12)", "#94a3b8"],
};

export default async function SubscriptionsPage() {
  await requireAdmin();

  const subscriptions = await db.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true, status: true } },
    },
  });

  const totalRevenue = subscriptions
    .filter(s => s.status === "active")
    .reduce((sum, s) => sum + (PLAN_PRICES[s.plan] ?? 0), 0);

  const statusCounts = subscriptions.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});

  const planCounts = subscriptions.reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: "0 0 4px" }}>
          💳 إدارة الاشتراكات
        </h1>
        <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 13, margin: 0 }}>
          {subscriptions.length} اشتراك إجمالاً
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "الإيراد الشهري", value: `${totalRevenue.toLocaleString()} ر`, color: "#f59e0b" },
          { label: "اشتراكات نشطة", value: statusCounts.active ?? 0, color: "#22c55e" },
          { label: "في التجربة", value: statusCounts.trial ?? 0, color: "#f59e0b" },
          { label: "منتهية/موقوفة", value: (statusCounts.expired ?? 0) + (statusCounts.suspended ?? 0), color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "16px",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Plan distribution */}
      <div style={{
        background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16, padding: "20px", marginBottom: 24,
      }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>توزيع الباقات</h2>
        <div style={{ display: "flex", gap: 12 }}>
          {Object.entries(PLAN_NAMES).map(([plan, name]) => {
            const count = planCounts[plan] ?? 0;
            const color = PLAN_COLORS[plan];
            const price = PLAN_PRICES[plan];
            return (
              <div key={plan} style={{
                flex: 1, padding: "14px 16px", borderRadius: 12,
                background: `${color}10`, border: `1px solid ${color}25`,
                textAlign: "center",
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color }}>{count}</div>
                <div style={{ fontSize: 12, color: "rgba(248,250,252,0.6)", marginTop: 2 }}>{name}</div>
                {price > 0 && <div style={{ fontSize: 11, color: "rgba(248,250,252,0.3)", marginTop: 2 }}>{price} ر/شهر</div>}
                {price === 0 && <div style={{ fontSize: 11, color: "rgba(248,250,252,0.3)", marginTop: 2 }}>مجاني</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscriptions table */}
      <div style={{
        background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 18, overflow: "hidden",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>جميع الاشتراكات</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["العميل", "الباقة", "الحالة", "السعر", "تاريخ البدء", "التجديد", "إجراء"].map(h => (
                  <th key={h} style={{
                    textAlign: "right", padding: "12px 16px",
                    fontSize: 11, color: "rgba(248,250,252,0.3)", fontWeight: 600,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map(sub => {
                const planColor = PLAN_COLORS[sub.plan] ?? "#999";
                const [statusBg, statusColor] = STATUS_COLORS[sub.status] ?? ["rgba(255,255,255,0.05)", "#94a3b8"];
                const isExpired = new Date(sub.trialEnds) < new Date() && sub.status === "trial";
                return (
                  <tr key={sub.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#f8fafc" }}>{sub.user.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(248,250,252,0.35)" }}>{sub.user.email}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: `${planColor}15`, color: planColor, border: `1px solid ${planColor}30`,
                      }}>
                        {PLAN_NAMES[sub.plan] ?? sub.plan}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 20, fontSize: 12,
                        background: statusBg, color: statusColor,
                        border: `1px solid ${statusColor}30`,
                      }}>
                        {sub.status === "trial" ? (isExpired ? "تجربة منتهية" : "تجريبي") :
                          sub.status === "active" ? "نشط" :
                          sub.status === "expired" ? "منتهي" : "موقوف"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "#f8fafc", fontWeight: 600 }}>
                      {PLAN_PRICES[sub.plan] > 0 ? `${PLAN_PRICES[sub.plan]} ر` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "rgba(248,250,252,0.45)" }}>
                      {new Date(sub.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "rgba(248,250,252,0.45)" }}>
                      {sub.status === "trial"
                        ? `ينتهي ${new Date(sub.trialEnds).toLocaleDateString("ar-SA")}`
                        : new Date(sub.renewsAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Link href={`/admin/clients/${sub.user.id}`} style={{
                        fontSize: 11, color: "#f59e0b", textDecoration: "none",
                        padding: "4px 12px", borderRadius: 7,
                        border: "1px solid rgba(245,158,11,0.25)",
                      }}>إدارة</Link>
                    </td>
                  </tr>
                );
              })}
              {subscriptions.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "rgba(248,250,252,0.25)", fontSize: 14 }}>لا توجد اشتراكات بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
