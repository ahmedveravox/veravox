"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const BUSINESS_TYPES = [
  "متجر إلكتروني", "مطعم / كافيه", "عيادة / صيدلية", "صالون / سبا",
  "خدمات تقنية", "عقارات", "تعليم / دورات", "لوجستيك / شحن", "أخرى",
];

const DIALECTS = [
  { value: "sa", label: "سعودي 🇸🇦" },
  { value: "ae", label: "إماراتي 🇦🇪" },
  { value: "eg", label: "مصري 🇪🇬" },
  { value: "kw", label: "كويتي 🇰🇼" },
  { value: "qa", label: "قطري 🇶🇦" },
  { value: "msa", label: "فصحى" },
];

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    businessName: "", businessType: "", dialect: "sa", tone: "friendly",
    referralCode: refCode,
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطأ"); setLoading(false); return; }

      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/dashboard");
    } catch {
      setError("خطأ في الاتصال");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: 10,
    background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)",
    color: "#f8fafc", fontSize: 15, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 14, fontWeight: 500,
    color: "rgba(248,250,252,0.7)", marginBottom: 8,
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f1e",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      backgroundImage: "radial-gradient(circle at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 60%)",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 20, color: "#0a0f1e",
            }}>ط</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#f8fafc", lineHeight: 1.1 }}>طيف</div>
              <div style={{ fontSize: 10, color: "rgba(245,158,11,0.6)", lineHeight: 1 }}>Tayf · AI Workforce</div>
            </div>
          </Link>
        </div>

        {/* Steps indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, padding: "0 4px" }}>
          {["معلوماتك", "نشاطك التجاري"].map((s, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                height: 4, borderRadius: 4,
                background: step > i ? "linear-gradient(90deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.08)",
                transition: "all 0.3s ease",
              }} />
              <div style={{ fontSize: 12, color: step > i ? "#f59e0b" : "rgba(248,250,252,0.35)", marginTop: 6, textAlign: "center" }}>
                {s}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 20, padding: "32px 28px",
        }}>
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>أهلاً! عرّف بنفسك</h2>
              <p style={{ margin: "0 0 8px", color: "rgba(248,250,252,0.5)", fontSize: 14 }}>7 أيام مجانية – لا بطاقة مطلوبة</p>

              <div>
                <label style={labelStyle}>الاسم الكامل</label>
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)}
                  placeholder="محمد أحمد" style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
                  placeholder="you@gmail.com" style={{ ...inputStyle, direction: "ltr", textAlign: "right" }} required />
              </div>
              <div>
                <label style={labelStyle}>كلمة المرور</label>
                <input type="password" value={form.password} onChange={e => update("password", e.target.value)}
                  placeholder="8 أحرف على الأقل" style={{ ...inputStyle, direction: "ltr", textAlign: "right" }} required />
              </div>

              {refCode && (
                <div style={{
                  padding: "10px 14px", borderRadius: 8,
                  background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                  color: "#fcd34d", fontSize: 13,
                }}>✓ رابط إحالة نشط – ستحصل على مزايا إضافية</div>
              )}

              <button
                onClick={() => { if (form.name && form.email && form.password.length >= 8) setStep(2); else setError("يرجى ملء جميع الحقول"); }}
                style={{
                  padding: "13px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#0a0f1e", fontWeight: 700, fontSize: 16,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >التالي ←</button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f8fafc" }}>عرّف نشاطك التجاري</h2>
              <p style={{ margin: "0 0 8px", color: "rgba(248,250,252,0.5)", fontSize: 14 }}>سيستخدمه AI لضبط ردوده بأسلوبك</p>

              <div>
                <label style={labelStyle}>اسم النشاط</label>
                <input type="text" value={form.businessName} onChange={e => update("businessName", e.target.value)}
                  placeholder="متجر نجوم | مطعم البيت" style={inputStyle} required />
              </div>

              <div>
                <label style={labelStyle}>نوع النشاط</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {BUSINESS_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => update("businessType", t)}
                      style={{
                        padding: "9px 6px", borderRadius: 8,
                        background: form.businessType === t ? "rgba(245,158,11,0.15)" : "rgba(15,23,42,0.8)",
                        border: form.businessType === t ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
                        color: form.businessType === t ? "#fcd34d" : "rgba(248,250,252,0.6)",
                        fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.15s ease",
                      }}>{t}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>اللهجة</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {DIALECTS.map(d => (
                    <button key={d.value} type="button" onClick={() => update("dialect", d.value)}
                      style={{
                        padding: "8px 14px", borderRadius: 8,
                        background: form.dialect === d.value ? "rgba(245,158,11,0.15)" : "rgba(15,23,42,0.8)",
                        border: form.dialect === d.value ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
                        color: form.dialect === d.value ? "#fcd34d" : "rgba(248,250,252,0.6)",
                        fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      }}>{d.label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>نبرة التواصل</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["friendly", "ودي 😊"], ["formal", "رسمي 👔"], ["quick", "سريع ⚡"]].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => update("tone", v)}
                      style={{
                        flex: 1, padding: "10px 8px", borderRadius: 8,
                        background: form.tone === v ? "rgba(245,158,11,0.15)" : "rgba(15,23,42,0.8)",
                        border: form.tone === v ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
                        color: form.tone === v ? "#fcd34d" : "rgba(248,250,252,0.6)",
                        fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      }}>{l}</button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 14 }}>{error}</div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(1)} style={{
                  padding: "13px 20px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent", color: "rgba(248,250,252,0.6)", fontSize: 15, cursor: "pointer", fontFamily: "inherit",
                }}>← رجوع</button>
                <button onClick={handleSubmit} disabled={loading || !form.businessName || !form.businessType}
                  style={{
                    flex: 1, padding: "13px", borderRadius: 10, border: "none",
                    background: loading ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "#0a0f1e", fontWeight: 700, fontSize: 16,
                    cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
                  }}>
                  {loading ? "جاري الإنشاء..." : "🚀 أطلق نشاطك"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "rgba(248,250,252,0.4)" }}>
          لديك حساب؟{" "}
          <Link href="/login" style={{ color: "#f59e0b", fontWeight: 600, textDecoration: "none" }}>سجّل دخولك</Link>
        </p>
      </div>
    </div>
  );
}
