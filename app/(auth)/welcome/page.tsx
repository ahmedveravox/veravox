"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LANGUAGES = [
  { code: "ar", label: "العربية",  flag: "🌙", desc: "Arabic",  tagline: "تكلّم بلهجتك" },
  { code: "en", label: "English",  flag: "🌍", desc: "الإنجليزية", tagline: "Speak your language" },
];

const DIALECTS = [
  { value: "sa",  label: "سعودي",   flag: "🇸🇦", en: "Saudi",   cities: ["الرياض","جدة","الدمام","مكة","المدينة"] },
  { value: "ae",  label: "إماراتي", flag: "🇦🇪", en: "Emirati", cities: ["دبي","أبوظبي","الشارقة","عجمان"] },
  { value: "eg",  label: "مصري",    flag: "🇪🇬", en: "Egyptian",cities: ["القاهرة","الإسكندرية","الجيزة"] },
  { value: "kw",  label: "كويتي",   flag: "🇰🇼", en: "Kuwaiti", cities: ["الكويت","حولي","الفروانية"] },
  { value: "qa",  label: "قطري",    flag: "🇶🇦", en: "Qatari",  cities: ["الدوحة","الريان","الوكرة"] },
  { value: "jo",  label: "أردني",   flag: "🇯🇴", en: "Jordanian",cities: ["عمّان","الزرقاء","إربد"] },
  { value: "sy",  label: "شامي",    flag: "🇸🇾", en: "Syrian",  cities: ["دمشق","حلب","حمص"] },
  { value: "iq",  label: "عراقي",   flag: "🇮🇶", en: "Iraqi",   cities: ["بغداد","البصرة","أربيل"] },
  { value: "ma",  label: "مغربي",   flag: "🇲🇦", en: "Moroccan",cities: ["الدار البيضاء","الرباط","مراكش"] },
  { value: "msa", label: "فصحى",    flag: "📖",  en: "Formal Arabic", cities: [] },
  { value: "en",  label: "English", flag: "🇬🇧", en: "English", cities: [] },
];

const AGENTS_PREVIEW = [
  { icon: "💼", label: "مبيعات",    color: "#4ade80" },
  { icon: "💬", label: "عملاء",    color: "#60a5fa" },
  { icon: "🎨", label: "تسويق",   color: "#f472b6" },
  { icon: "📊", label: "تحليل",   color: "#2dd4bf" },
  { icon: "🧠", label: "مدير",    color: "#f87171" },
  { icon: "📱", label: "سوشال",   color: "#fcd34d" },
];

const LogoSVG = ({ size = 52 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wl1" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fcd34d"/>
        <stop offset="50%" stopColor="#f59e0b"/>
        <stop offset="100%" stopColor="#b45309"/>
      </linearGradient>
      <linearGradient id="ws" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,0.22)"/>
        <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
      </linearGradient>
    </defs>
    <rect width="52" height="52" rx="15" fill="url(#wl1)"/>
    <rect width="52" height="52" rx="15" fill="url(#ws)"/>
    <path d="M14 33 C14 33 14 22 19 19 C22 17.5 25 19 26 22 C27 25 27 29 25.5 32 C24 35 21 36 18.5 34.5"
      stroke="#0a0f1e" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
    <path d="M26 22 C27.5 19.5 30 18 32.5 19 C35.5 20.5 37 23 37 26 C37 30 34.5 34 30.5 35.5"
      stroke="#0a0f1e" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
    <circle cx="30.5" cy="37" r="2" fill="#0a0f1e"/>
    <circle cx="18.5" cy="36.5" r="2" fill="#0a0f1e"/>
  </svg>
);

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState("");
  const [dialect, setDialect] = useState("");
  const [city, setCity] = useState("");
  const isEn = lang === "en";

  const selectedDialect = DIALECTS.find(d => d.value === dialect);

  function proceed() {
    if (step === 1 && lang) {
      if (lang === "en") {
        // English speakers: go directly to register with English dialect
        router.push(`/register?lang=en&dialect=en`);
      } else {
        setStep(2);
      }
    } else if (step === 2 && dialect) {
      if (selectedDialect?.cities && selectedDialect.cities.length > 0 && !city) {
        setStep(3);
      } else {
        const params = new URLSearchParams({ lang, dialect, city });
        router.push(`/register?${params.toString()}`);
      }
    } else if (step === 3) {
      const params = new URLSearchParams({ lang, dialect, city });
      router.push(`/register?${params.toString()}`);
    }
  }

  return (
    <div className="hero-bg" style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden",
    }}>
      {/* Ambient bg */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.09) 0%, transparent 65%)" }}/>
        <div style={{ position: "absolute", bottom: "0%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)" }}/>
        {/* Floating agent icons */}
        {AGENTS_PREVIEW.map((a, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${[8, 88, 5, 92, 12, 85][i]}%`,
            top: `${[20, 30, 65, 70, 45, 55][i]}%`,
            fontSize: 22,
            opacity: 0.12,
            animation: `float ${3 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.6}s`,
          }}>{a.icon}</div>
        ))}
      </div>

      <div className="fade-in" style={{ width: "100%", maxWidth: 520, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div className="glow-pulse" style={{ display: "inline-flex", marginBottom: 14 }}>
            <LogoSVG size={64} />
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 900, letterSpacing: "-0.5px",
            background: "linear-gradient(135deg, #f0f4ff 0%, #fcd34d 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 6,
          }}>موظفي</h1>
          <p style={{ fontSize: 15, color: "rgba(240,244,255,0.45)", fontWeight: 400 }}>
            فريق ذكاء اصطناعي يشتغل بدلك · AI Workforce OS
          </p>
          {/* Agent preview pills */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
            {AGENTS_PREVIEW.map((a, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20,
                background: `${a.color}12`, border: `1px solid ${a.color}25`,
                fontSize: 12, color: a.color, fontWeight: 500,
                animation: `fade-in 0.3s ease ${i * 0.06}s both`,
              }}>
                {a.icon} {a.label}
              </div>
            ))}
          </div>
        </div>

        {/* Step progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 3,
              background: step >= s
                ? "linear-gradient(90deg, #f59e0b, #fcd34d)"
                : "rgba(255,255,255,0.07)",
              transition: "all 0.4s ease",
            }}/>
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(10,16,32,0.88)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 24,
          padding: "32px 28px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}>

          {/* STEP 1 – Language */}
          {step === 1 && (
            <div className="fade-in-fast">
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0f4ff", marginBottom: 6 }}>
                اختر لغتك
              </h2>
              <p style={{ fontSize: 14, color: "rgba(240,244,255,0.4)", marginBottom: 24 }}>
                Choose your language
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)} style={{
                    padding: "20px 16px", borderRadius: 16, cursor: "pointer",
                    border: lang === l.code
                      ? "2px solid rgba(245,158,11,0.6)"
                      : "1px solid rgba(255,255,255,0.07)",
                    background: lang === l.code
                      ? "rgba(245,158,11,0.08)"
                      : "rgba(255,255,255,0.02)",
                    textAlign: "center", fontFamily: "inherit",
                    transition: "all 0.2s ease",
                    transform: lang === l.code ? "scale(1.02)" : "scale(1)",
                    boxShadow: lang === l.code ? "0 0 24px rgba(245,158,11,0.15)" : "none",
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{l.flag}</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: lang === l.code ? "#fcd34d" : "#f0f4ff", marginBottom: 3 }}>
                      {l.label}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(240,244,255,0.35)" }}>{l.tagline}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 – Dialect */}
          {step === 2 && (
            <div className="fade-in-fast">
              <button onClick={() => { setStep(1); setDialect(""); setCity(""); }} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(240,244,255,0.4)", fontSize: 13, padding: 0, marginBottom: 16,
                display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
              }}>→ رجوع</button>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0f4ff", marginBottom: 6 }}>
                اختر لهجتك
              </h2>
              <p style={{ fontSize: 14, color: "rgba(240,244,255,0.4)", marginBottom: 22 }}>
                الموظفين يتكلمون بلهجتك
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9 }}>
                {DIALECTS.filter(d => d.value !== "en").map(d => (
                  <button key={d.value} onClick={() => setDialect(d.value)} style={{
                    padding: "14px 8px", borderRadius: 14, cursor: "pointer",
                    border: dialect === d.value
                      ? "2px solid rgba(245,158,11,0.5)"
                      : "1px solid rgba(255,255,255,0.06)",
                    background: dialect === d.value ? "rgba(245,158,11,0.09)" : "rgba(255,255,255,0.02)",
                    fontFamily: "inherit", transition: "all 0.18s ease",
                    transform: dialect === d.value ? "scale(1.04)" : "scale(1)",
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{d.flag}</div>
                    <div style={{ fontSize: 12, fontWeight: dialect === d.value ? 700 : 500, color: dialect === d.value ? "#fcd34d" : "#f0f4ff" }}>
                      {d.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 – City */}
          {step === 3 && selectedDialect && selectedDialect.cities.length > 0 && (
            <div className="fade-in-fast">
              <button onClick={() => { setStep(2); setCity(""); }} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(240,244,255,0.4)", fontSize: 13, padding: 0, marginBottom: 16,
                display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
              }}>→ رجوع</button>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#f0f4ff", marginBottom: 6 }}>
                {selectedDialect.flag} مدينتك؟
              </h2>
              <p style={{ fontSize: 14, color: "rgba(240,244,255,0.4)", marginBottom: 22 }}>
                لتحسين ردود موظفيك
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedDialect.cities.map(c => (
                  <button key={c} onClick={() => setCity(c)} style={{
                    padding: "13px 18px", borderRadius: 12, cursor: "pointer",
                    border: city === c ? "2px solid rgba(245,158,11,0.5)" : "1px solid rgba(255,255,255,0.06)",
                    background: city === c ? "rgba(245,158,11,0.09)" : "rgba(255,255,255,0.02)",
                    color: city === c ? "#fcd34d" : "#f0f4ff",
                    fontFamily: "inherit", fontWeight: city === c ? 700 : 500,
                    fontSize: 15, textAlign: "right",
                    transition: "all 0.18s ease",
                  }}>{c}</button>
                ))}
                <button onClick={() => setCity("أخرى")} style={{
                  padding: "13px 18px", borderRadius: 12, cursor: "pointer",
                  border: city === "أخرى" ? "2px solid rgba(245,158,11,0.5)" : "1px solid rgba(255,255,255,0.06)",
                  background: city === "أخرى" ? "rgba(245,158,11,0.09)" : "transparent",
                  color: city === "أخرى" ? "#fcd34d" : "rgba(240,244,255,0.4)",
                  fontFamily: "inherit", fontSize: 14, textAlign: "right",
                  transition: "all 0.18s ease",
                }}>مدينة أخرى</button>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={proceed}
            disabled={(step === 1 && !lang) || (step === 2 && !dialect) || (step === 3 && !city)}
            className="btn-gold"
            style={{
              width: "100%", padding: "14px", fontSize: 16,
              marginTop: 24,
              opacity: ((step === 1 && !lang) || (step === 2 && !dialect) || (step === 3 && !city)) ? 0.4 : 1,
              cursor: ((step === 1 && !lang) || (step === 2 && !dialect) || (step === 3 && !city)) ? "not-allowed" : "pointer",
            }}>
            {step === 3 ? "ابدأ مجاناً 🚀" : "التالي ←"}
          </button>

          <div className="divider" style={{ margin: "20px 0" }}/>
          <p style={{ textAlign: "center", fontSize: 14, color: "rgba(240,244,255,0.35)" }}>
            لديك حساب؟{" "}
            <Link href="/login" style={{ color: "#f59e0b", fontWeight: 700, textDecoration: "none" }}>
              سجّل دخولك
            </Link>
          </p>
        </div>

        {/* Social proof */}
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <p style={{ fontSize: 13, color: "rgba(240,244,255,0.2)" }}>
            🔒 لا بطاقة مطلوبة · 7 أيام مجانية · إلغاء في أي وقت
          </p>
        </div>
      </div>
    </div>
  );
}
