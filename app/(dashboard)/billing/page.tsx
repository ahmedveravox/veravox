import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

const PLANS = [
  {
    key: "starter", name: "البداية", price: 199, agents: 1,
    color: "#22c55e", features: ["موظف AI واحد", "اختيار الوظيفة", "لوحة تحكم", "دعم 24/7"],
  },
  {
    key: "team", name: "الفريق الأساسي", price: 299, agents: 3,
    color: "#3b82f6", features: ["3 موظفين AI", "لوحة تحكم متقدمة", "تقارير أسبوعية", "دعم أولوية"],
  },
  {
    key: "growth", name: "النمو", price: 499, agents: 5,
    color: "#f59e0b", popular: true,
    features: ["5 موظفين AI", "محلل أعمال", "تنبيهات ذكية", "تكاملات واتساب", "دعم أولوية"],
  },
  {
    key: "business", name: "الأعمال", price: 999, agents: 10,
    color: "#ef4444",
    features: ["جميع الموظفين", "مدير AI", "محلل أعمال", "تكاملات متقدمة", "مدير حساب مخصص"],
  },
];

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const subscription = await db.subscription.findUnique({ where: { userId: session.user.id } });
  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.trialEnds).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: "0 0 6px" }}>💳 الباقات والاشتراك</h1>
        <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 14, margin: 0 }}>اختر الباقة المناسبة لنشاطك</p>
      </div>

      {/* Current subscription */}
      <div style={{
        background: "rgba(30,41,59,0.8)", border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 16, padding: "20px 24px", marginBottom: 28,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ fontSize: 13, color: "rgba(248,250,252,0.5)", marginBottom: 4 }}>باقتك الحالية</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>
            {subscription?.plan === "trial" ? "تجريبية مجانية" :
              PLANS.find(p => p.key === subscription?.plan)?.name ?? subscription?.plan ?? "—"}
          </div>
          {subscription?.status === "trial" && (
            <div style={{ fontSize: 13, color: "#fcd34d", marginTop: 4 }}>⏰ {daysLeft} أيام متبقية في التجربة</div>
          )}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "rgba(248,250,252,0.5)", marginBottom: 4 }}>الموظفون المتاحون</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#f59e0b" }}>{subscription?.maxAgents ?? 1}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "rgba(248,250,252,0.5)", marginBottom: 4 }}>الحالة</div>
          <div style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600,
            background: subscription?.status === "active" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
            color: subscription?.status === "active" ? "#4ade80" : "#fcd34d",
            border: subscription?.status === "active" ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(245,158,11,0.3)",
          }}>
            {subscription?.status === "trial" ? "تجريبي" : subscription?.status === "active" ? "نشط" : "—"}
          </div>
        </div>
      </div>

      {/* Plans */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
        {PLANS.map(plan => {
          const isCurrent = subscription?.plan === plan.key;
          return (
            <div key={plan.key} style={{
              background: plan.popular ? "rgba(245,158,11,0.04)" : "rgba(30,41,59,0.8)",
              border: plan.popular ? "1px solid rgba(245,158,11,0.35)" : isCurrent ? `1px solid ${plan.color}40` : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: "24px 20px",
              position: "relative",
              boxShadow: plan.popular ? "0 0 40px rgba(245,158,11,0.08)" : "none",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -11, right: 18,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#0a0f1e", fontSize: 11, fontWeight: 700,
                  padding: "3px 12px", borderRadius: 20,
                }}>الأكثر طلباً ⭐</div>
              )}
              {isCurrent && (
                <div style={{
                  position: "absolute", top: -11, left: 18,
                  background: "rgba(34,197,94,0.2)", border: "1px solid #22c55e",
                  color: "#4ade80", fontSize: 11, fontWeight: 600,
                  padding: "3px 12px", borderRadius: 20,
                }}>باقتك الحالية</div>
              )}
              <div style={{ color: plan.color, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 38, fontWeight: 800, color: "#f8fafc" }}>{plan.price}</span>
                <span style={{ color: "rgba(248,250,252,0.4)", fontSize: 13 }}>ريال/شهر</span>
              </div>
              <div style={{ color: "rgba(248,250,252,0.35)", fontSize: 12, marginBottom: 18 }}>
                {plan.agents === 10 ? "جميع الموظفين" : `${plan.agents} موظف AI`}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 7 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "rgba(248,250,252,0.7)" }}>
                    <span style={{ color: plan.popular ? "#f59e0b" : "#22c55e" }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <div style={{ textAlign: "center" }}>
                {isCurrent ? (
                  <div style={{ padding: "10px 0", color: "rgba(248,250,252,0.35)", fontSize: 14 }}>باقتك الحالية</div>
                ) : (
                  <div style={{
                    display: "block", textAlign: "center",
                    padding: "10px 0", borderRadius: 10,
                    background: plan.popular ? "linear-gradient(135deg, #f59e0b, #d97706)" : "transparent",
                    border: plan.popular ? "none" : "1px solid rgba(245,158,11,0.3)",
                    color: plan.popular ? "#0a0f1e" : "#f59e0b",
                    fontWeight: 700, fontSize: 14, cursor: "pointer",
                  }}>
                    التواصل للترقية
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Extra agents */}
      <div style={{
        marginTop: 20, padding: "18px 24px", borderRadius: 16,
        background: "rgba(30,41,59,0.6)", border: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        <div style={{ fontSize: 22 }}>➕</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#f8fafc", marginBottom: 3 }}>موظفون إضافيون</div>
          <div style={{ fontSize: 13, color: "rgba(248,250,252,0.5)" }}>
            أول 3 موظفين إضافيين: <span style={{ color: "#f59e0b" }}>+49 ريال/شهر</span> لكل موظف
            <br />بعد ذلك: <span style={{ color: "#f59e0b" }}>+79 ريال/شهر</span> لكل موظف
          </div>
        </div>
      </div>

      {/* Enterprise */}
      <div style={{
        marginTop: 16, padding: "24px", borderRadius: 20,
        background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, color: "#f8fafc", marginBottom: 6 }}>🏢 Enterprise – للشركات الكبيرة</div>
          <div style={{ fontSize: 14, color: "rgba(248,250,252,0.5)" }}>
            نظام مخصص كامل، ربط أنظمة خارجية، تخصيص ذكاء اصطناعي
            <br />من <span style={{ color: "#f59e0b" }}>1,999 – 4,999 ريال</span> حسب الاحتياج
          </div>
        </div>
        <div style={{
          padding: "12px 24px", borderRadius: 12,
          border: "1px solid rgba(245,158,11,0.3)",
          color: "#f59e0b", fontWeight: 700, fontSize: 15, cursor: "pointer",
          whiteSpace: "nowrap",
        }}>تواصل معنا</div>
      </div>
    </div>
  );
}
