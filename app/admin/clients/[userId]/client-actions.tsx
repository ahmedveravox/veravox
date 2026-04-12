"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  clientId: string;
  currentStatus: string;
  currentPlan: string;
}

const PLAN_CONFIGS: Record<string, { maxAgents: number; label: string }> = {
  trial:    { maxAgents: 1,  label: "تجريبي" },
  starter:  { maxAgents: 1,  label: "البداية (199 ريال)" },
  team:     { maxAgents: 3,  label: "الفريق (299 ريال)" },
  growth:   { maxAgents: 5,  label: "النمو (499 ريال)" },
  business: { maxAgents: 10, label: "الأعمال (999 ريال)" },
};

export default function AdminClientActions({ clientId, currentStatus, currentPlan }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newPlan, setNewPlan] = useState(currentPlan);
  const [msg, setMsg] = useState("");

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
    setMsg("✓ تم تحديث الباقة");
    setTimeout(() => setMsg(""), 3000);
    router.refresh();
  }

  return (
    <div style={{ marginTop: 18, background: "rgba(20,30,50,0.9)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 16, padding: "20px" }}>
      <h2 style={{ margin: "0 0 18px", fontSize: 14, fontWeight: 700, color: "#f87171" }}>⚙️ إجراءات المدير</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Status toggle */}
        <div>
          <div style={{ fontSize: 12, color: "rgba(248,250,252,0.5)", marginBottom: 10 }}>حالة الحساب</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => updateStatus("active")} disabled={currentStatus === "active" || loading} style={{
              flex: 1, padding: "10px", borderRadius: 9, fontFamily: "inherit",
              background: currentStatus === "active" ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.08)",
              border: currentStatus === "active" ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(34,197,94,0.15)",
              color: "#4ade80", fontWeight: 600, fontSize: 13, cursor: currentStatus === "active" ? "default" : "pointer",
            }}>✓ تفعيل</button>
            <button onClick={() => updateStatus("suspended")} disabled={currentStatus === "suspended" || loading} style={{
              flex: 1, padding: "10px", borderRadius: 9, fontFamily: "inherit",
              background: currentStatus === "suspended" ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.06)",
              border: currentStatus === "suspended" ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(239,68,68,0.15)",
              color: "#f87171", fontWeight: 600, fontSize: 13, cursor: currentStatus === "suspended" ? "default" : "pointer",
            }}>✗ إيقاف</button>
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
          {msg && <div style={{ marginTop: 8, fontSize: 12, color: "#4ade80" }}>{msg}</div>}
        </div>
      </div>
    </div>
  );
}
