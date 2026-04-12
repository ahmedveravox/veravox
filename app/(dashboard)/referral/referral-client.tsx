"use client";
import { useState } from "react";

interface Referral {
  id: string;
  referredEmail: string;
  status: string;
  reward: number;
  createdAt: Date;
}

interface Props {
  referralCode: string;
  referralUrl: string;
  referrals: Referral[];
  totalReward: number;
}

const MILESTONES = [
  { count: 1, reward: "30 ريال رصيد", icon: "🎁", color: "#4ade80" },
  { count: 3, reward: "100-150 ريال + خصم", icon: "💰", color: "#60a5fa" },
  { count: 5, reward: "موظف AI مجاني شهر", icon: "🤖", color: "#f59e0b" },
  { count: 10, reward: "مزايا حصرية قوية", icon: "👑", color: "#f87171" },
];

export default function ReferralClient({ referralCode, referralUrl, referrals, totalReward }: Props) {
  const [copied, setCopied] = useState(false);
  const completedCount = referrals.filter(r => r.status === "completed").length;

  function copyLink() {
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const nextMilestone = MILESTONES.find(m => m.count > completedCount);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: "0 0 6px" }}>🔁 سوِّق واربح</h1>
        <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 14, margin: 0 }}>
          شارك رابطك وكسب مكافآت على كل عميل يشترك
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "عملاء دعوتهم", value: completedCount, icon: "👥", color: "#f59e0b" },
          { label: "رصيد مكتسب", value: `${totalReward} ريال`, icon: "💰", color: "#22c55e" },
          { label: "المكافأة القادمة", value: nextMilestone?.reward ?? "تجاوزت الكل 🏆", icon: nextMilestone?.icon ?? "👑", color: "#c084fc" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: "20px",
          }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: typeof s.value === "number" ? 32 : 18, fontWeight: 800, color: s.color, marginBottom: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 13, color: "rgba(248,250,252,0.45)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div style={{
        background: "rgba(30,41,59,0.8)", border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 20, padding: "24px", marginBottom: 24,
      }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>رابطك الخاص</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            flex: 1, padding: "12px 16px", borderRadius: 10,
            background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.06)",
            color: "rgba(248,250,252,0.6)", fontSize: 14, direction: "ltr", textAlign: "left",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{referralUrl}</div>
          <button onClick={copyLink} style={{
            padding: "12px 20px", borderRadius: 10, border: "none",
            background: copied ? "rgba(34,197,94,0.8)" : "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0f1e", fontWeight: 700, fontSize: 14,
            cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
            transition: "all 0.2s ease",
          }}>
            {copied ? "✓ تم النسخ!" : "نسخ الرابط"}
          </button>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: "rgba(248,250,252,0.4)" }}>
          شارك هذا الرابط مع أصحاب الأعمال – ستحصل على مكافأة فور تسجيلهم
        </p>
      </div>

      {/* Milestones */}
      <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px", marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>مراحل المكافآت</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {MILESTONES.map((m, i) => {
            const reached = completedCount >= m.count;
            const progress = Math.min((completedCount / m.count) * 100, 100);
            return (
              <div key={i} style={{
                padding: "16px 18px", borderRadius: 14,
                background: reached ? `${m.color}10` : "rgba(15,23,42,0.5)",
                border: reached ? `1px solid ${m.color}30` : "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: reached ? 0 : 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{m.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: reached ? m.color : "rgba(248,250,252,0.7)" }}>
                        {m.count} {m.count === 1 ? "عميل" : "عملاء"}
                      </div>
                      <div style={{ fontSize: 13, color: "rgba(248,250,252,0.45)" }}>{m.reward}</div>
                    </div>
                  </div>
                  {reached && (
                    <div style={{
                      padding: "4px 12px", borderRadius: 20,
                      background: `${m.color}20`, border: `1px solid ${m.color}40`,
                      color: m.color, fontSize: 12, fontWeight: 600,
                    }}>✓ تحقق</div>
                  )}
                </div>
                {!reached && (
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      background: `linear-gradient(90deg, ${m.color}, ${m.color}80)`,
                      width: `${progress}%`, transition: "width 0.5s ease",
                    }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent referrals */}
      {referrals.length > 0 && (
        <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>آخر الإحالات</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {referrals.slice(0, 10).map(r => (
              <div key={r.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderRadius: 12,
                background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(245,158,11,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, color: "#f59e0b",
                  }}>👤</div>
                  <div>
                    <div style={{ fontSize: 14, color: "#f8fafc" }}>
                      {r.referredEmail.replace(/(.{3}).*(@.*)/, "$1***$2")}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(248,250,252,0.35)" }}>
                      {new Date(r.createdAt).toLocaleDateString("ar-SA")}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>+{r.reward} ريال</span>
                  <div style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 12,
                    background: r.status === "completed" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                    color: r.status === "completed" ? "#4ade80" : "#fcd34d",
                    border: r.status === "completed" ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(245,158,11,0.2)",
                  }}>
                    {r.status === "completed" ? "مكتمل" : "قيد المراجعة"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
