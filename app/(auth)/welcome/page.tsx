"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LANGUAGES = [
  { code: "ar", label: "العربية", flag: "🌙", desc: "Arabic" },
  { code: "en", label: "English", flag: "🌍", desc: "الإنجليزية" },
];

const DIALECTS = [
  { value: "sa", label: "سعودي", flag: "🇸🇦", cities: ["الرياض", "جدة", "الدمام", "مكة", "المدينة"] },
  { value: "ae", label: "إماراتي", flag: "🇦🇪", cities: ["دبي", "أبوظبي", "الشارقة", "عجمان"] },
  { value: "eg", label: "مصري", flag: "🇪🇬", cities: ["القاهرة", "الإسكندرية", "الجيزة", "أسوان"] },
  { value: "kw", label: "كويتي", flag: "🇰🇼", cities: ["الكويت", "حولي", "الفروانية", "الجهراء"] },
  { value: "qa", label: "قطري", flag: "🇶🇦", cities: ["الدوحة", "الريان", "الوكرة", "الخور"] },
  { value: "jo", label: "أردني", flag: "🇯🇴", cities: ["عمّان", "الزرقاء", "إربد", "العقبة"] },
  { value: "sy", label: "شامي", flag: "🇸🇾", cities: ["دمشق", "حلب", "حمص", "اللاذقية"] },
  { value: "iq", label: "عراقي", flag: "🇮🇶", cities: ["بغداد", "البصرة", "أربيل", "الموصل"] },
  { value: "ma", label: "مغربي", flag: "🇲🇦", cities: ["الدار البيضاء", "الرباط", "مراكش", "فاس"] },
  { value: "msa", label: "فصحى", flag: "📖", cities: [] },
];

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [lang, setLang] = useState("");
  const [dialect, setDialect] = useState("");
  const [city, setCity] = useState("");

  const selectedDialect = DIALECTS.find(d => d.value === dialect);

  function proceed() {
    if (step === 1 && lang) setStep(2);
    else if (step === 2 && dialect) {
      if (selectedDialect?.cities.length && !city) setStep(3);
      else {
        const params = new URLSearchParams({ lang, dialect, city });
        router.push(`/register?${params.toString()}`);
      }
    } else if (step === 3) {
      const params = new URLSearchParams({ lang, dialect, city });
      router.push(`/register?${params.toString()}`);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f1e",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden",
    }}>
      {/* Background effects */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 520, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 28, color: "#0a0f1e",
              boxShadow: "0 0 40px rgba(245,158,11,0.3)",
            }}>م</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 22, color: "#f8fafc" }}>موظفي</div>
              <div style={{ fontSize: 12, color: "rgba(245,158,11,0.7)" }}>Muwazafi · AI Workforce OS</div>
            </div>
          </Link>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32, justifyContent: "center" }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              height: 4, width: s <= step ? 48 : 24, borderRadius: 2,
              background: s <= step ? "linear-gradient(90deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.08)",
              transition: "all 0.4s ease",
            }} />
          ))}
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 24, padding: "36px 32px", backdropFilter: "blur(20px)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        }}>

          {/* Step 1: Language */}
          {step === 1 && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", textAlign: "center", marginBottom: 8 }}>
                مرحباً بك 👋
              </h1>
              <p style={{ color: "rgba(248,250,252,0.5)", textAlign: "center", fontSize: 14, marginBottom: 28 }}>
                اختر لغتك المفضلة للبداية
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)} style={{
                    padding: "20px 16px", borderRadius: 16, cursor: "pointer",
                    background: lang === l.code ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)",
                    border: lang === l.code ? "2px solid rgba(245,158,11,0.5)" : "2px solid rgba(255,255,255,0.06)",
                    color: "#f8fafc", fontFamily: "inherit", transition: "all 0.2s ease",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 28 }}>{l.flag}</span>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{l.label}</span>
                    <span style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>{l.desc}</span>
                    {lang === l.code && <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#0a0f1e", fontWeight: 800 }}>✓</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Dialect */}
          {step === 2 && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", textAlign: "center", marginBottom: 8, direction: "rtl" }}>
                من أين أنت؟ 🌍
              </h1>
              <p style={{ color: "rgba(248,250,252,0.5)", textAlign: "center", fontSize: 14, marginBottom: 24, direction: "rtl" }}>
                موظفوك AI سيتكلمون بلهجتك
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxHeight: 360, overflowY: "auto", paddingLeft: 4 }}>
                {DIALECTS.map(d => (
                  <button key={d.value} onClick={() => setDialect(d.value)} style={{
                    padding: "14px 12px", borderRadius: 12, cursor: "pointer",
                    background: dialect === d.value ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)",
                    border: dialect === d.value ? "2px solid rgba(245,158,11,0.5)" : "2px solid rgba(255,255,255,0.05)",
                    color: "#f8fafc", fontFamily: "inherit", transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", gap: 10, direction: "rtl",
                  }}>
                    <span style={{ fontSize: 22 }}>{d.flag}</span>
                    <span style={{ fontSize: 14, fontWeight: dialect === d.value ? 700 : 500 }}>{d.label}</span>
                    {dialect === d.value && <div style={{ marginRight: "auto", width: 16, height: 16, borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#0a0f1e", fontWeight: 800 }}>✓</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: City */}
          {step === 3 && selectedDialect && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", textAlign: "center", marginBottom: 8, direction: "rtl" }}>
                {selectedDialect.flag} مدينتك؟
              </h1>
              <p style={{ color: "rgba(248,250,252,0.5)", textAlign: "center", fontSize: 14, marginBottom: 24, direction: "rtl" }}>
                لتخصيص تجربتك بشكل أدق
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedDialect.cities.map(c => (
                  <button key={c} onClick={() => setCity(c)} style={{
                    padding: "14px 18px", borderRadius: 12, cursor: "pointer",
                    background: city === c ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)",
                    border: city === c ? "2px solid rgba(245,158,11,0.5)" : "2px solid rgba(255,255,255,0.05)",
                    color: city === c ? "#fcd34d" : "rgba(248,250,252,0.7)",
                    fontFamily: "inherit", fontSize: 15, fontWeight: city === c ? 700 : 400,
                    transition: "all 0.2s ease", textAlign: "right", direction: "rtl",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span>{c}</span>
                    {city === c && <span style={{ fontSize: 16 }}>✓</span>}
                  </button>
                ))}
                <button onClick={() => setCity("أخرى")} style={{
                  padding: "14px 18px", borderRadius: 12, cursor: "pointer",
                  background: city === "أخرى" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.02)",
                  border: city === "أخرى" ? "2px solid rgba(245,158,11,0.5)" : "2px dashed rgba(255,255,255,0.08)",
                  color: "rgba(248,250,252,0.4)", fontFamily: "inherit", fontSize: 14,
                  textAlign: "right", direction: "rtl",
                }}>
                  مدينة أخرى
                </button>
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={proceed}
            disabled={
              (step === 1 && !lang) ||
              (step === 2 && !dialect) ||
              (step === 3 && !city)
            }
            style={{
              width: "100%", marginTop: 24, padding: "15px",
              borderRadius: 14, border: "none",
              background: (
                (step === 1 && !lang) ||
                (step === 2 && !dialect) ||
                (step === 3 && !city)
              ) ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: (
                (step === 1 && !lang) ||
                (step === 2 && !dialect) ||
                (step === 3 && !city)
              ) ? "rgba(255,255,255,0.2)" : "#0a0f1e",
              fontWeight: 800, fontSize: 16, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.2s ease",
              direction: "rtl",
            }}
          >
            {step === 3 || (step === 2 && selectedDialect?.cities.length === 0)
              ? "ابدأ الآن 🚀"
              : "التالي ←"}
          </button>

          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              width: "100%", marginTop: 10, padding: "11px",
              borderRadius: 12, border: "none", background: "transparent",
              color: "rgba(248,250,252,0.35)", cursor: "pointer",
              fontFamily: "inherit", fontSize: 14, direction: "rtl",
            }}>
              → رجوع
            </button>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(248,250,252,0.3)", direction: "rtl" }}>
          لديك حساب؟{" "}
          <Link href="/login" style={{ color: "#f59e0b", textDecoration: "none", fontWeight: 600 }}>
            سجّل دخولك
          </Link>
        </p>
      </div>
    </div>
  );
}
