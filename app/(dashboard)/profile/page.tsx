"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AGENT_META: Record<string, { icon: string; label: string; desc: string; color: string }> = {
  sales:        { icon: "💼", label: "موظف مبيعات", desc: "يقفل صفقات ويرسل عروض", color: "#4ade80" },
  support:      { icon: "💬", label: "خدمة عملاء", desc: "رد 24/7 ودعم كامل", color: "#60a5fa" },
  technical:    { icon: "🔧", label: "دعم فني", desc: "يحل المشاكل التقنية", color: "#c084fc" },
  marketing:    { icon: "🎨", label: "تسويق وإبداع", desc: "حملات وأفكار إبداعية", color: "#f472b6" },
  social:       { icon: "📱", label: "سوشال ميديا", desc: "محتوى وتفاعل يومي", color: "#fcd34d" },
  analyst:      { icon: "📊", label: "محلل أعمال", desc: "تقارير واستراتيجيات", color: "#2dd4bf" },
  manager:      { icon: "🧠", label: "مدير AI", desc: "قرارات وأولويات", color: "#f87171" },
  orders:       { icon: "📦", label: "موظف الطلبات", desc: "شحن ومتابعة", color: "#fb923c" },
  reservations: { icon: "📅", label: "الحجوزات", desc: "مواعيد وتأكيدات", color: "#818cf8" },
  invoices:     { icon: "🧾", label: "الفواتير", desc: "فواتير ومدفوعات", color: "#facc15" },
};

const ALL_AGENT_TYPES = Object.keys(AGENT_META);

interface Business {
  id: string; name: string; type: string;
  dialect: string; tone: string;
  products?: string; paymentLinks?: string;
  policies?: string; whatsapp?: string;
  agents: Array<{ id: string; agentType: string; isActive: boolean }>;
}

export default function ProfilePage() {
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [maxAgents, setMaxAgents] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", type: "", dialect: "sa", tone: "friendly", products: "", paymentLinks: "", policies: "", whatsapp: "" });

  useEffect(() => { fetchProfile(); }, []);

  async function fetchProfile() {
    const res = await fetch("/api/profile");
    if (!res.ok) { router.push("/login"); return; }
    const data = await res.json();
    setBusiness(data.business);
    setMaxAgents(data.maxAgents ?? 1);
    setForm({
      name: data.business?.name ?? "",
      type: data.business?.type ?? "",
      dialect: data.business?.dialect ?? "sa",
      tone: data.business?.tone ?? "friendly",
      products: data.business?.products ?? "",
      paymentLinks: data.business?.paymentLinks ?? "",
      policies: data.business?.policies ?? "",
      whatsapp: data.business?.whatsapp ?? "",
    });
    setLoading(false);
  }

  async function saveProfile() {
    setSaving(true);
    await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function toggleAgent(agentType: string) {
    const existing = business?.agents.find(a => a.agentType === agentType);
    const isActive = existing?.isActive;
    const activeCount = business?.agents.filter(a => a.isActive).length ?? 0;

    if (!isActive && activeCount >= maxAgents) {
      alert(`باقتك تسمح بـ${maxAgents} موظف فقط. ترقية الباقة من صفحة الاشتراك`);
      return;
    }

    await fetch("/api/agents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentType, active: !isActive }) });
    fetchProfile();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)",
    color: "#f8fafc", fontSize: 14, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box", resize: "vertical",
  };

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "rgba(248,250,252,0.4)" }}>⏳ جاري التحميل...</div>;

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: "0 0 6px" }}>🏪 ملف نشاطي التجاري</h1>
        <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 14, margin: 0 }}>
          AI يستخدم هذه المعلومات لضبط ردوده بأسلوب نشاطك
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Business info */}
        <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>معلومات النشاط</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>اسم النشاط</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>نوع النشاط</label>
              <input value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>واتساب (للتحويل)</label>
              <input value={form.whatsapp} onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))} placeholder="+966XXXXXXXXX" style={{ ...inputStyle, direction: "ltr", textAlign: "right" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>اللهجة</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["sa", "سعودي"], ["ae", "إماراتي"], ["eg", "مصري"], ["kw", "كويتي"], ["msa", "فصحى"]].map(([v, l]) => (
                  <button key={v} onClick={() => setForm(p => ({ ...p, dialect: v }))} style={{
                    padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                    background: form.dialect === v ? "rgba(245,158,11,0.15)" : "rgba(15,23,42,0.8)",
                    border: form.dialect === v ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    color: form.dialect === v ? "#fcd34d" : "rgba(248,250,252,0.6)",
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>نبرة التواصل</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[["friendly", "ودي 😊"], ["formal", "رسمي 👔"], ["quick", "سريع ⚡"]].map(([v, l]) => (
                  <button key={v} onClick={() => setForm(p => ({ ...p, tone: v }))} style={{
                    flex: 1, padding: "8px 6px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
                    background: form.tone === v ? "rgba(245,158,11,0.15)" : "rgba(15,23,42,0.8)",
                    border: form.tone === v ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
                    color: form.tone === v ? "#fcd34d" : "rgba(248,250,252,0.6)",
                  }}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products & Policies */}
        <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>المنتجات والسياسات</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>المنتجات والخدمات</label>
              <textarea value={form.products} onChange={e => setForm(p => ({ ...p, products: e.target.value }))} rows={3} placeholder="مثال: قميص قطني - 89 ريال&#10;بنطلون جينز - 149 ريال" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>روابط الدفع</label>
              <textarea value={form.paymentLinks} onChange={e => setForm(p => ({ ...p, paymentLinks: e.target.value }))} rows={2} placeholder="مثال: paylink.sa/abc123" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>سياسة البيع والإرجاع</label>
              <textarea value={form.policies} onChange={e => setForm(p => ({ ...p, policies: e.target.value }))} rows={3} placeholder="مثال: الإرجاع خلال 7 أيام من تاريخ الاستلام" style={inputStyle} />
            </div>
          </div>
        </div>
      </div>

      <button onClick={saveProfile} disabled={saving} style={{
        marginTop: 16, padding: "13px 32px", borderRadius: 12, border: "none",
        background: saved ? "rgba(34,197,94,0.8)" : "linear-gradient(135deg, #f59e0b, #d97706)",
        color: "#0a0f1e", fontWeight: 700, fontSize: 15,
        cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
        transition: "all 0.2s ease",
      }}>
        {saving ? "جاري الحفظ..." : saved ? "✓ تم الحفظ!" : "حفظ التغييرات"}
      </button>

      {/* Agents management */}
      <div style={{ marginTop: 28, background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>موظفو AI</h2>
          <span style={{ fontSize: 13, color: "rgba(248,250,252,0.4)" }}>
            {business?.agents.filter(a => a.isActive).length ?? 0} / {maxAgents} نشط
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {ALL_AGENT_TYPES.map(type => {
            const meta = AGENT_META[type];
            const agent = business?.agents.find(a => a.agentType === type);
            const isActive = agent?.isActive ?? false;
            return (
              <div key={type} style={{
                padding: "14px 16px", borderRadius: 14,
                background: isActive ? `${meta.color}10` : "rgba(15,23,42,0.6)",
                border: isActive ? `1px solid ${meta.color}30` : "1px solid rgba(255,255,255,0.05)",
                cursor: "pointer", transition: "all 0.2s ease",
              }} onClick={() => toggleAgent(type)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{meta.icon}</span>
                  <div style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: isActive ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
                    border: isActive ? "1px solid #22c55e" : "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: isActive ? "#22c55e" : "transparent",
                  }}>✓</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 13, color: isActive ? "#f8fafc" : "rgba(248,250,252,0.5)", marginBottom: 3 }}>{meta.label}</div>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,0.35)" }}>{meta.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
