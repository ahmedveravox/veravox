"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  clientId: string;
  currentStatus: string;
  currentPlan: string;
  trialEnds?: string;
}

const PLAN_CONFIGS: Record<string, { maxAgents: number; label: string }> = {
  trial:    { maxAgents: 1,  label: "تجريبي" },
  starter:  { maxAgents: 1,  label: "البداية (199 ريال)" },
  team:     { maxAgents: 3,  label: "الفريق (299 ريال)" },
  growth:   { maxAgents: 5,  label: "النمو (499 ريال)" },
  business: { maxAgents: 10, label: "الأعمال (999 ريال)" },
};

const btnStyle = (color: string, active?: boolean): React.CSSProperties => ({
  flex: 1, padding: "10px", borderRadius: 9, fontFamily: "inherit",
  background: active ? `rgba(${color},0.2)` : `rgba(${color},0.06)`,
  border: active ? `1px solid rgba(${color},0.4)` : `1px solid rgba(${color},0.15)`,
  color: `rgb(${color})`, fontWeight: 600, fontSize: 13, cursor: active ? "default" : "pointer",
});

export default function AdminClientActions({ clientId, currentStatus, currentPlan, trialEnds }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newPlan, setNewPlan] = useState(currentPlan);
  const [msg, setMsg] = useState("");
  const [trialDays, setTrialDays] = useState("7");
  const [trialMsg, setTrialMsg] = useState("");

  const setFeedback = (setter: (s: string) => void, text: string) => {
    setter(text);
    setTimeout(() => setter(""), 3500);
  };

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/admin/clients/${clientId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function upgradePlan() {
    setLoading(true);
    const config = PLAN_CONFIGS[newPlan];
    await fetch(`/api/admin/clients/${clientId}/plan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: newPlan, maxAgents: config.maxAgents }),
    });
    setLoading(false);
    setFeedback(setMsg, "✓ تم تحديث الباقة");
    router.refresh();
  }

  async function extendTrial() {
    const days = parseInt(trialDays);
    if (isNaN(days) || days < 1) { setFeedback(setTrialMsg, "أدخل عدد أيام صحيح"); return; }
    setLoading(true);
    const res = await fetch(`/api/admin/clients/${clientId}/trial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    });
    setLoading(false);
    if (res.ok) {
      setFeedback(setTrialMsg, `✓ تم تمديد التجربة بـ ${days} يوم`);
      router.refresh();
    } else {
      const d = await res.json();
      setFeedback(setTrialMsg, `خطأ: ${d.error}`);
    }
  }

  return (
    <div style={{ marginTop: 18, background: "rgba(20,30,50,0.9)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 16, padding: "20px" }}>
      <h2 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 700, color: "#f87171" }}>⚙️ إجراءات المدير</h2>

      <div className="admin-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Status toggle */}
        <div>
          <div style={{ fontSize: 12, color: "rgba(248,250,252,0.5)", marginBottom: 10 }}>حالة الحساب</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => updateStatus("active")} disabled={currentStatus === "active" || loading}
              style={btnStyle("34,197,94", currentStatus === "active")}>✓ تفعيل</button>
            <button onClick={() => updateStatus("suspended")} disabled={currentStatus === "suspended" || loading}
              style={btnStyle("239,68,68", currentStatus === "suspended")}>✗ إيقاف</button>
          </div>
        </div>

        {/* Plan upgrade */}
        <div>
          <div style={{ fontSize: 12, color: "rgba(248,250,252,0.5)", marginBottom: 10 }}>تغيير الباقة</div>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={newPlan} onChange={e => setNewPlan(e.target.value)} style={{
              flex: 1, padding: "9px 12px", borderRadius: 9,
              background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#f8fafc", fontSize: 13, outline: "none", fontFamily: "inherit",
            }}>
              {Object.entries(PLAN_CONFIGS).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <button onClick={upgradePlan} disabled={loading} style={{
              padding: "9px 16px", borderRadius: 9, border: "none",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#0a0f1e", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}>حفظ</button>
          </div>
          {msg && <div style={{ marginTop: 8, fontSize: 12, color: msg.startsWith("✓") ? "#4ade80" : "#f87171" }}>{msg}</div>}
        </div>

        {/* Trial extension */}
        <div>
          <div style={{ fontSize: 12, color: "rgba(248,250,252,0.5)", marginBottom: 10 }}>
            تمديد التجربة
            {trialEnds && (
              <span style={{ color: "rgba(248,250,252,0.3)", marginRight: 6 }}>
                (تنتهي: {new Date(trialEnds).toLocaleDateString("ar-SA")})
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              value={trialDays}
              onChange={e => setTrialDays(e.target.value)}
              min={1}
              max={365}
              placeholder="أيام"
              style={{
                flex: 1, padding: "9px 12px", borderRadius: 9,
                background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)",
                color: "#f8fafc", fontSize: 13, outline: "none", fontFamily: "inherit",
              }}
            />
            <button onClick={extendTrial} disabled={loading} style={{
              padding: "9px 14px", borderRadius: 9,
              background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)",
              color: "#f59e0b", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}>⏰ تمديد</button>
          </div>
          {trialMsg && <div style={{ marginTop: 8, fontSize: 12, color: trialMsg.startsWith("✓") ? "#4ade80" : "#f87171" }}>{trialMsg}</div>}
        </div>
      </div>
    </div>
  );
}
