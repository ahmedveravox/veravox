"use client";
import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const BUSINESS_TYPES = [
  { value: "متجر إلكتروني", icon: "🛍️" },
  { value: "مطعم / كافيه",  icon: "🍽️" },
  { value: "عيادة / صيدلية", icon: "🏥" },
  { value: "صالون / سبا",   icon: "💇" },
  { value: "خدمات تقنية",   icon: "💻" },
  { value: "عقارات",        icon: "🏢" },
  { value: "تعليم / دورات", icon: "📚" },
  { value: "لوجستيك / شحن", icon: "📦" },
  { value: "أخرى",          icon: "✨" },
];

const DIALECTS = [
  { value: "sa",  label: "سعودي",    flag: "🇸🇦" },
  { value: "ae",  label: "إماراتي",  flag: "🇦🇪" },
  { value: "eg",  label: "مصري",     flag: "🇪🇬" },
  { value: "kw",  label: "كويتي",    flag: "🇰🇼" },
  { value: "qa",  label: "قطري",     flag: "🇶🇦" },
  { value: "jo",  label: "أردني",    flag: "🇯🇴" },
  { value: "sy",  label: "شامي",     flag: "🇸🇾" },
  { value: "iq",  label: "عراقي",    flag: "🇮🇶" },
  { value: "ma",  label: "مغربي",    flag: "🇲🇦" },
  { value: "msa", label: "فصحى",     flag: "📖" },
  { value: "en",  label: "English",  flag: "🇬🇧" },
];

const LogoSVG = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <defs>
      <linearGradient id="rl1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fcd34d"/>
        <stop offset="50%" stopColor="#f59e0b"/>
        <stop offset="100%" stopColor="#b45309"/>
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="11" fill="url(#rl1)"/>
    <path d="M10 26 C10 26 10 17 14.5 15 C17 14 19.5 15 20.5 17.5 C21.5 20 21 24 19.5 26.5 C18 29 15.5 29.5 13.5 28"
      stroke="#0a0f1e" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    <path d="M20.5 17.5 C22 15.5 24 14.5 26 15.5 C28.5 16.5 29.5 19 29.5 21.5 C29.5 25 27.5 28 24.5 29"
      stroke="#0a0f1e" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
    <circle cx="24.5" cy="30" r="1.5" fill="#0a0f1e"/>
    <circle cx="13.5" cy="29.5" r="1.5" fill="#0a0f1e"/>
  </svg>
);

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
  const refCode        = searchParams.get("ref")     || "";
  const welcomeLang    = searchParams.get("lang")    || "ar";
  const welcomeDialect = searchParams.get("dialect") || "sa";

  const isEn = welcomeLang === "en";

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    businessName: "", businessType: "", dialect: welcomeDialect, tone: "friendly",
    referralCode: refCode,
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    setError("");
  }

  function validateStep1(): string {
    if (!form.name.trim()) return isEn ? "Please enter your full name" : "أدخل اسمك الكامل";
    if (form.name.trim().split(" ").length < 2) return isEn ? "Please enter first and last name" : "أدخل الاسم الأول والأخير";
    if (!form.email.trim()) return isEn ? "Please enter your email" : "أدخل البريد الإلكتروني";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return isEn ? "Invalid email format" : "صيغة البريد غير صحيحة";
    if (!form.password) return isEn ? "Password required" : "أدخل كلمة المرور";
    if (form.password.length < 8) return isEn ? "Minimum 8 characters" : "كلمة المرور 8 أحرف على الأقل";
    return "";
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطأ"); setLoading(false); return; }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/dashboard");
    } catch {
      setError(isEn ? "Connection error, try again" : "خطأ في الاتصال");
      setLoading(false);
    }
  }

  const inputSt: React.CSSProperties = {
    width: "100%", padding: "13px 16px", borderRadius: 12,
    background: "rgba(8,14,28,0.8)", border: "1px solid rgba(255,255,255,0.08)",
    color: "#f0f4ff", fontSize: 15, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  };

  const labelSt: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 600,
    color: "rgba(240,244,255,0.6)", marginBottom: 8,
  };

  return (
    <div className="hero-bg" style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24, position: "relative", overflow: "hidden",
    }}>
      {/* Ambient bg */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 65%)" }}/>
        <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)" }}/>
      </div>

      <div className="fade-in" style={{ width: "100%", maxWidth: 490, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/welcome" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <LogoSVG />
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, color: "#f0f4ff", lineHeight: 1.15 }}>موظفي</div>
              <div style={{ fontSize: 10, color: "rgba(245,158,11,0.6)", lineHeight: 1, fontWeight: 600 }}>AI Workforce OS</div>
            </div>
          </Link>
        </div>

        {/* Step progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[
            isEn ? "Your Info" : "معلوماتك",
            isEn ? "Your Business" : "نشاطك التجاري",
          ].map((s, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{
                height: 4, borderRadius: 4,
                background: step > i
                  ? "linear-gradient(90deg, #f59e0b, #fcd34d)"
                  : "rgba(255,255,255,0.07)",
                transition: "all 0.35s ease",
              }}/>
              <div style={{ fontSize: 11, color: step > i ? "#f59e0b" : "rgba(240,244,255,0.3)", marginTop: 5, textAlign: "center", fontWeight: step > i ? 600 : 400 }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(10,16,32,0.88)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 24,
          padding: "36px 32px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="fade-in-fast" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f0f4ff", marginBottom: 4 }}>
                  {isEn ? "Hello! Let's get started 👋" : "أهلاً! عرّف بنفسك 👋"}
                </h2>
                <p style={{ fontSize: 14, color: "rgba(240,244,255,0.4)" }}>
                  {isEn ? "7 days free – no card required" : "7 أيام مجانية – لا بطاقة مطلوبة"}
                </p>
              </div>

              <div>
                <label style={labelSt}>{isEn ? "Full Name" : "الاسم الكامل"}</label>
                <input
                  type="text" value={form.name}
                  onChange={e => update("name", e.target.value)}
                  placeholder={isEn ? "John Smith" : ""}
                  style={inputSt}
                  onFocus={e => { e.target.style.borderColor = "rgba(245,158,11,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label style={labelSt}>{isEn ? "Email Address" : "البريد الإلكتروني"}</label>
                <input
                  type="email" value={form.email}
                  onChange={e => update("email", e.target.value)}
                  placeholder="you@company.com"
                  style={{ ...inputSt, direction: "ltr", textAlign: "right" }}
                  onFocus={e => { e.target.style.borderColor = "rgba(245,158,11,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label style={labelSt}>{isEn ? "Password" : "كلمة المرور"}</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    value={form.password}
                    onChange={e => update("password", e.target.value)}
                    placeholder={isEn ? "Min 8 characters" : "8 أحرف على الأقل"}
                    style={{ ...inputSt, direction: "ltr", textAlign: "right", paddingLeft: 44 }}
                    onFocus={e => { e.target.style.borderColor = "rgba(245,158,11,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.08)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{
                    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(240,244,255,0.3)", fontSize: 16, padding: 0,
                  }}>{showPass ? "🙈" : "👁"}</button>
                </div>
              </div>

              {refCode && (
                <div style={{
                  padding: "10px 14px", borderRadius: 12,
                  background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)",
                  color: "#fcd34d", fontSize: 13, display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span>✓</span>
                  <span>{isEn ? "Referral link active – you'll get extra benefits!" : "رابط إحالة نشط – ستحصل على مزايا إضافية!"}</span>
                </div>
              )}

              {error && (
                <div className="fade-in-fast" style={{
                  padding: "11px 14px", borderRadius: 12,
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171", fontSize: 13, textAlign: "center",
                }}>{error}</div>
              )}

              <button
                onClick={() => {
                  const err = validateStep1();
                  if (err) { setError(err); return; }
                  setStep(2);
                }}
                className="btn-gold"
                style={{ padding: "14px", fontSize: 16, marginTop: 4 }}>
                {isEn ? "Next →" : "التالي ←"}
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="fade-in-fast" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f0f4ff", marginBottom: 4 }}>
                  {isEn ? "Tell us about your business 🏪" : "عرّف نشاطك التجاري 🏪"}
                </h2>
                <p style={{ fontSize: 14, color: "rgba(240,244,255,0.4)" }}>
                  {isEn ? "AI uses this to speak your brand's voice" : "سيستخدمه AI لضبط ردوده بأسلوبك"}
                </p>
              </div>

              <div>
                <label style={labelSt}>{isEn ? "Business Name" : "اسم النشاط"}</label>
                <input
                  type="text" value={form.businessName}
                  onChange={e => update("businessName", e.target.value)}
                  placeholder={isEn ? "My Awesome Store" : "متجر نجوم / مطعم البيت"}
                  style={inputSt}
                  onFocus={e => { e.target.style.borderColor = "rgba(245,158,11,0.45)"; e.target.style.boxShadow = "0 0 0 3px rgba(245,158,11,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label style={labelSt}>{isEn ? "Business Type" : "نوع النشاط"}</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {BUSINESS_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => update("businessType", t.value)} style={{
                      padding: "10px 6px", borderRadius: 10,
                      background: form.businessType === t.value ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.02)",
                      border: form.businessType === t.value ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.07)",
                      color: form.businessType === t.value ? "#fcd34d" : "rgba(240,244,255,0.55)",
                      fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s ease",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    }}>
                      <span style={{ fontSize: 18 }}>{t.icon}</span>
                      <span>{t.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelSt}>{isEn ? "AI Language / Dialect" : "لهجة الموظفين"}</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DIALECTS.map(d => (
                    <button key={d.value} type="button" onClick={() => update("dialect", d.value)} style={{
                      padding: "7px 12px", borderRadius: 20, fontSize: 12,
                      background: form.dialect === d.value ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.03)",
                      border: form.dialect === d.value ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.07)",
                      color: form.dialect === d.value ? "#fcd34d" : "rgba(240,244,255,0.5)",
                      cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s ease",
                    }}>
                      {d.flag} {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelSt}>{isEn ? "Communication Style" : "نبرة التواصل"}</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {([
                    ["friendly", isEn ? "Friendly 😊" : "ودي 😊"],
                    ["formal",   isEn ? "Formal 👔"   : "رسمي 👔"],
                    ["quick",    isEn ? "Quick ⚡"    : "سريع ⚡"],
                  ] as [string,string][]).map(([v, l]) => (
                    <button key={v} type="button" onClick={() => update("tone", v)} style={{
                      flex: 1, padding: "11px 6px", borderRadius: 10,
                      background: form.tone === v ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.02)",
                      border: form.tone === v ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.07)",
                      color: form.tone === v ? "#fcd34d" : "rgba(240,244,255,0.55)",
                      fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                      transition: "all 0.15s ease", fontWeight: form.tone === v ? 600 : 400,
                    }}>{l}</button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="fade-in-fast" style={{
                  padding: "11px 14px", borderRadius: 12,
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171", fontSize: 13,
                }}>{error}</div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => { setStep(1); setError(""); }}
                  className="btn-ghost"
                  style={{ padding: "13px 20px", fontSize: 15 }}>
                  {isEn ? "← Back" : "← رجوع"}
                </button>
                <button
                  onClick={() => {
                    if (!form.businessName.trim()) { setError(isEn ? "Enter your business name" : "أدخل اسم النشاط"); return; }
                    if (!form.businessType) { setError(isEn ? "Select business type" : "اختر نوع النشاط"); return; }
                    handleSubmit();
                  }}
                  disabled={loading}
                  className="btn-gold"
                  style={{
                    flex: 1, padding: "13px", fontSize: 16,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}>
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span className="pulse-gold">⏳</span>
                      {isEn ? "Creating your team..." : "جاري إنشاء فريقك..."}
                    </span>
                  ) : (isEn ? "🚀 Launch My AI Team" : "🚀 أطلق فريقك")}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "rgba(240,244,255,0.35)" }}>
          {isEn ? "Already have an account? " : "لديك حساب؟ "}
          <Link href="/login" style={{ color: "#f59e0b", fontWeight: 700, textDecoration: "none" }}>
            {isEn ? "Sign in" : "سجّل دخولك"}
          </Link>
        </p>
      </div>
    </div>
  );
}
