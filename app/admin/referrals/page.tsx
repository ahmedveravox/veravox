import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "الإحالات – Admin" };

export default async function ReferralsPage() {
  await requireAdmin();

  const referrals = await db.referral.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      referrer: { select: { id: true, name: true, email: true, referralCode: true } },
    },
  });

  // Group by referrer to get top referrers
  const byReferrer = referrals.reduce<Record<string, { name: string; email: string; userId: string; code: string; total: number; completed: number; reward: number }>>((acc, r) => {
    const key = r.referrerId;
    if (!acc[key]) {
      acc[key] = { name: r.referrer.name, email: r.referrer.email, userId: r.referrer.id, code: r.referrer.referralCode, total: 0, completed: 0, reward: 0 };
    }
    acc[key].total++;
    if (r.status === "completed") {
      acc[key].completed++;
      acc[key].reward += r.reward;
    }
    return acc;
  }, {});

  const topReferrers = Object.values(byReferrer).sort((a, b) => b.completed - a.completed).slice(0, 5);

  const totalCompleted = referrals.filter(r => r.status === "completed").length;
  const totalPending = referrals.filter(r => r.status === "pending").length;
  const totalRewards = referrals.filter(r => r.status === "completed").reduce((sum, r) => sum + r.reward, 0);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: "0 0 4px" }}>
          🔁 نظام الإحالات
        </h1>
        <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 13, margin: 0 }}>
          تتبع الإحالات ومكافآت العملاء
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "إجمالي الإحالات", value: referrals.length, color: "#3b82f6" },
          { label: "إحالات مكتملة", value: totalCompleted, color: "#22c55e" },
          { label: "إحالات معلقة", value: totalPending, color: "#f59e0b" },
          { label: "مكافآت مستحقة", value: `${totalRewards} ر`, color: "#f59e0b" },
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Top referrers */}
        <div style={{
          background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 18, padding: "20px",
        }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>
            🏆 أكثر المحيلين
          </h2>
          {topReferrers.length === 0 ? (
            <p style={{ color: "rgba(248,250,252,0.25)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>لا توجد إحالات بعد</p>
          ) : topReferrers.map((r, i) => (
            <div key={r.userId} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 0",
              borderBottom: i < topReferrers.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: i === 0 ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 14, color: i === 0 ? "#0a0f1e" : "rgba(248,250,252,0.4)",
                flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#f8fafc" }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  كود: {r.code.slice(0, 8)}...
                </div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#4ade80" }}>{r.completed}</div>
                <div style={{ fontSize: 10, color: "rgba(248,250,252,0.3)" }}>مكتملة</div>
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#f59e0b" }}>{r.reward} ر</div>
                <div style={{ fontSize: 10, color: "rgba(248,250,252,0.3)" }}>مكافأة</div>
              </div>
            </div>
          ))}
        </div>

        {/* All referrals list */}
        <div style={{
          background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 18, padding: "20px",
        }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>
            آخر الإحالات
          </h2>
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {referrals.slice(0, 20).map(r => (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div>
                  <div style={{ fontSize: 13, color: "#f8fafc", fontWeight: 500 }}>
                    {r.referrer.name}
                    <span style={{ color: "rgba(248,250,252,0.3)", margin: "0 6px" }}>→</span>
                    <span style={{ color: "rgba(248,250,252,0.6)" }}>{r.referredEmail}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(248,250,252,0.3)", marginTop: 2 }}>
                    {new Date(r.createdAt).toLocaleDateString("ar-SA")}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {r.status === "completed" && (
                    <span style={{ fontSize: 11, color: "#f59e0b" }}>{r.reward} ر</span>
                  )}
                  <span style={{
                    padding: "2px 10px", borderRadius: 20, fontSize: 11,
                    background: r.status === "completed" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                    color: r.status === "completed" ? "#4ade80" : "#fcd34d",
                    border: r.status === "completed" ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(245,158,11,0.2)",
                  }}>
                    {r.status === "completed" ? "مكتملة" : "معلقة"}
                  </span>
                </div>
              </div>
            ))}
            {referrals.length === 0 && (
              <p style={{ color: "rgba(248,250,252,0.25)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>لا توجد إحالات</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
