"use client";
import React, { useState } from "react";
import Link from "next/link";

const AGENTS = [
  { icon: "💼", title: "موظف مبيعات", en: "Sales Agent", desc: "يقفل صفقات، يرسل عروض، يتابع العملاء", color: "#4ade80" },
  { icon: "💬", title: "خدمة العملاء", en: "Customer Support", desc: "رد 24/7، دعم كامل، ترجمة تلقائية", color: "#60a5fa" },
  { icon: "🔧", title: "دعم فني", en: "Technical Support", desc: "يحل المشاكل التقنية خطوة بخطوة", color: "#c084fc" },
  { icon: "🎨", title: "تسويق وإبداع", en: "Marketing & Creative", desc: "حملات، إعلانات، أفكار إبداعية", color: "#f472b6" },
  { icon: "📱", title: "سوشال ميديا", en: "Social Media", desc: "محتوى يومي، ردود، إدارة حملات", color: "#fcd34d" },
  { icon: "📊", title: "محلل أعمال", en: "Business Analyst", desc: "تقارير، تحليل أداء، استراتيجيات نمو", color: "#2dd4bf" },
  { icon: "🧠", title: "مدير AI", en: "AI Manager", desc: "يدير الموظفين ويحدد الأولويات", color: "#f87171" },
  { icon: "📦", title: "موظف الطلبات", en: "Orders Agent", desc: "شحن، متابعة، مرتجعات", color: "#fb923c" },
  { icon: "📅", title: "الحجوزات", en: "Reservations", desc: "مواعيد، تأكيدات، تذكيرات", color: "#818cf8" },
  { icon: "🧾", title: "الفواتير", en: "Invoices & Payments", desc: "فواتير، متابعة دفع، تنبيهات", color: "#facc15" },
];

const PLANS = [
  { key: "starter", name: "البداية", en: "Starter", price: 199, agents: 1, color: "#22c55e", features: ["موظف AI واحد", "لوحة تحكم", "7 أيام مجاناً"] },
  { key: "team", name: "الفريق", en: "Team", price: 299, agents: 3, color: "#3b82f6", features: ["3 موظفين AI", "تقارير أسبوعية", "دعم أولوية"] },
  { key: "growth", name: "النمو", en: "Growth", price: 499, agents: 5, color: "#f59e0b", popular: true, features: ["5 موظفين AI", "محلل أعمال", "تنبيهات ذكية", "تكامل واتساب"] },
  { key: "business", name: "الأعمال", en: "Business", price: 999, agents: 10, color: "#ef4444", features: ["جميع الموظفين", "مدير AI", "تكاملات متقدمة", "مدير حساب"] },
];

const STATS = [
  { n: "10+", label: "موظف AI", en: "AI Agents" },
  { n: "24/7", label: "تشغيل مستمر", en: "Always On" },
  { n: "10", label: "لهجات عربية", en: "Arabic Dialects" },
  { n: "7", label: "أيام مجاناً", en: "Days Free" },
];

export default function LandingPage() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [hoveredAgent, setHoveredAgent] = useState<number | null>(null);

  const t = (ar: React.ReactNode, en: React.ReactNode): React.ReactNode => lang === "ar" ? ar : en;

  return (
    <div className="geo-bg" style={{ minHeight: "100vh", direction: lang === "ar" ? "rtl" : "ltr" }}>

      {/* ── Navbar ── */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(10,15,30,0.9)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 50,
        padding: "0 24px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 20, color: "#0a0f1e",
          }}>م</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#f8fafc" }}>موظفي</span>
          <span style={{ fontSize: 12, color: "rgba(245,158,11,0.7)", fontWeight: 500 }}>Muwazafi</span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Lang toggle */}
          <button onClick={() => setLang(l => l === "ar" ? "en" : "ar")} style={{
            padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent", color: "rgba(248,250,252,0.6)", fontSize: 12,
            cursor: "pointer", fontFamily: "inherit",
          }}>{lang === "ar" ? "EN" : "ع"}</button>
          <Link href="/login" style={{
            color: "rgba(248,250,252,0.65)", textDecoration: "none", fontSize: 14, fontWeight: 500,
          }}>{t("دخول", "Sign In")}</Link>
          <Link href="/welcome" style={{
            padding: "8px 18px", borderRadius: 10,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0f1e", fontWeight: 700, textDecoration: "none", fontSize: 14,
          }}>{t("ابدأ مجاناً", "Start Free")}</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ textAlign: "center", padding: "80px 24px 60px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 50, padding: "5px 14px", marginBottom: 24, fontSize: 13, color: "#fcd34d",
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e" }} />
          {t("النظام الأول من نوعه في المنطقة العربية", "The First AI Workforce OS in the Arab World")}
        </div>

        <h1 style={{ fontSize: "clamp(32px, 6vw, 66px)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 20px", color: "#f8fafc" }}>
          {t(
            <>فريق موظفين{" "}<span style={{ background: "linear-gradient(135deg,#f59e0b,#fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>طيف AI</span><br />يشتغل بدل فريقك</>,
            <>Your{" "}<span style={{ background: "linear-gradient(135deg,#f59e0b,#fcd34d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tayf AI</span>{" "}Workforce<br />Works While You Sleep</>
          )}
        </h1>

        <p style={{ color: "rgba(248,250,252,0.6)", fontSize: "clamp(15px, 2.5vw, 19px)", maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.85 }}>
          {t(
            "10 موظفين ذكاء اصطناعي متخصصين يعملون 24/7 بلهجتك وأسلوب نشاطك – مبيعات، دعم، تسويق، تحليل وأكثر",
            "10 specialized AI agents working 24/7 in your dialect and style – sales, support, marketing, analytics & more"
          )}
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/welcome" style={{
            padding: "14px 32px", borderRadius: 12,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0f1e", fontWeight: 700, textDecoration: "none",
            fontSize: 16, boxShadow: "0 8px 28px rgba(245,158,11,0.28)",
          }}>🚀 {t("ابدأ 7 أيام مجاناً", "Start 7 Days Free")}</Link>
          <a href="#agents" style={{
            padding: "14px 32px", borderRadius: 12,
            border: "1px solid rgba(245,158,11,0.3)",
            color: "#f59e0b", textDecoration: "none", fontSize: 16, fontWeight: 600,
          }}>{t("اكتشف الموظفين", "Meet the Agents")}</a>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 52, flexWrap: "wrap" }}>
          {STATS.map(s => (
            <div key={s.n} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b" }}>{s.n}</div>
              <div style={{ fontSize: 12, color: "rgba(248,250,252,0.45)", marginTop: 3 }}>{t(s.label, s.en)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Agents ── */}
      <section id="agents" style={{ padding: "60px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 42px)", fontWeight: 800, color: "#f8fafc", margin: "0 0 10px" }}>
            {t("فريقك الكامل من الموظفين AI", "Your Complete AI Team")}
          </h2>
          <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 16 }}>
            {t("كل موظف متخصص ويتكيف مع أسلوب نشاطك", "Each agent specializes in its role and adapts to your business style")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {AGENTS.map((agent, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredAgent(i)}
              onMouseLeave={() => setHoveredAgent(null)}
              style={{
                background: hoveredAgent === i ? "rgba(245,158,11,0.05)" : "rgba(30,41,59,0.8)",
                border: hoveredAgent === i ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(255,255,255,0.05)",
                borderRadius: 16, padding: "20px 18px",
                transition: "all 0.2s ease",
                transform: hoveredAgent === i ? "translateY(-3px)" : "translateY(0)",
                cursor: "default",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `${agent.color}15`,
                  border: `1px solid ${agent.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>{agent.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#f8fafc" }}>{t(agent.title, agent.en)}</div>
                </div>
              </div>
              <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 13, lineHeight: 1.65, margin: 0 }}>{agent.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "60px 24px", maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 800, color: "#f8fafc", margin: "0 0 10px" }}>
          {t("كيف تبدأ؟", "How It Works")}
        </h2>
        <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 16, marginBottom: 44 }}>
          {t("3 خطوات وفريقك جاهز", "3 steps and your team is ready")}
        </p>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { n: "1", icon: "📋", ar: "عرّف نشاطك", en: "Define Your Business", d_ar: "أدخل اسم النشاط، منتجاتك، وسياساتك", d_en: "Enter your business name, products, and policies" },
            { n: "2", icon: "🤖", ar: "اختر موظفيك", en: "Choose Your Agents", d_ar: "اختر الموظفين AI من 10 تخصصات", d_en: "Pick AI agents from 10 specializations" },
            { n: "3", icon: "🚀", ar: "شغّل وراقب", en: "Launch & Monitor", d_ar: "موظفوك يبدأون فوراً، تابع من لوحة التحكم", d_en: "Your agents start immediately, monitor from the dashboard" },
          ].map(item => (
            <div key={item.n} style={{
              flex: "1 1 210px", maxWidth: 250,
              background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 20, padding: "28px 20px",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 800, color: "#0a0f1e",
                margin: "0 auto 14px",
              }}>{item.n}</div>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#f8fafc", marginBottom: 8 }}>{t(item.ar, item.en)}</div>
              <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{t(item.d_ar, item.d_en)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: "60px 24px", maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 800, color: "#f8fafc", margin: "0 0 10px" }}>
            {t("باقات تناسب كل نشاط", "Plans for Every Business")}
          </h2>
          <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 16 }}>
            {t("ابدأ مجاناً 7 أيام – لا بطاقة مطلوبة", "Start free for 7 days – no credit card required")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 18 }}>
          {PLANS.map(plan => (
            <div key={plan.key} style={{
              background: plan.popular ? "rgba(245,158,11,0.04)" : "rgba(30,41,59,0.8)",
              border: plan.popular ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgba(255,255,255,0.05)",
              borderRadius: 20, padding: "24px 20px",
              position: "relative",
              boxShadow: plan.popular ? "0 0 40px rgba(245,158,11,0.08)" : "none",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -11, right: lang === "ar" ? 20 : "auto", left: lang === "en" ? 20 : "auto",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#0a0f1e", fontSize: 11, fontWeight: 700,
                  padding: "3px 12px", borderRadius: 20,
                }}>{t("الأكثر طلباً ⭐", "Most Popular ⭐")}</div>
              )}
              <div style={{ color: plan.color, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                {t(plan.name, plan.en)}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 38, fontWeight: 800, color: "#f8fafc" }}>{plan.price}</span>
                <span style={{ color: "rgba(248,250,252,0.4)", fontSize: 13 }}>{t("ريال/شهر", "SAR/mo")}</span>
              </div>
              <div style={{ color: "rgba(248,250,252,0.35)", fontSize: 12, marginBottom: 18 }}>
                {plan.agents === 10 ? t("جميع الموظفين", "All Agents") : `${plan.agents} ${t("موظف AI", "AI Agents")}`}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map((f, fi) => (
                  <li key={fi} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(248,250,252,0.7)" }}>
                    <span style={{ color: plan.popular ? "#f59e0b" : "#22c55e" }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/welcome" style={{
                display: "block", textAlign: "center",
                padding: "11px 0", borderRadius: 10,
                background: plan.popular ? "linear-gradient(135deg, #f59e0b, #d97706)" : "transparent",
                border: plan.popular ? "none" : "1px solid rgba(245,158,11,0.25)",
                color: plan.popular ? "#0a0f1e" : "#f59e0b",
                fontWeight: 700, textDecoration: "none", fontSize: 14,
              }}>{t("ابدأ الآن", "Get Started")}</Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "rgba(248,250,252,0.35)" }}>
          {t("موظف إضافي:", "Extra agent:")} <span style={{ color: "#f59e0b" }}>+49 {t("ريال", "SAR")}</span> ({t("أول 3", "first 3")}) · <span style={{ color: "#f59e0b" }}>+79 {t("ريال", "SAR")}</span> ({t("بعد ذلك", "after that")})
        </p>
      </section>

      {/* ── Referral CTA ── */}
      <section style={{ padding: "40px 24px 60px", maxWidth: 740, margin: "0 auto" }}>
        <div style={{
          background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.18)",
          borderRadius: 24, padding: "36px 32px", textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 14 }}>🔁</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f8fafc", margin: "0 0 10px" }}>
            {t("سوِّق واربح 🔥", "Refer & Earn 🔥")}
          </h2>
          <p style={{ color: "rgba(248,250,252,0.6)", fontSize: 15, lineHeight: 1.85, margin: "0 0 24px" }}>
            {t(
              <>جيب عميل = <strong style={{ color: "#f59e0b" }}>30 ريال رصيد</strong><br />5 عملاء = <strong style={{ color: "#f59e0b" }}>موظف AI مجاني شهر</strong><br />10 عملاء = <strong style={{ color: "#f59e0b" }}>مزايا حصرية</strong></>,
              <>1 referral = <strong style={{ color: "#f59e0b" }}>30 SAR credit</strong><br />5 referrals = <strong style={{ color: "#f59e0b" }}>Free AI agent for a month</strong><br />10 referrals = <strong style={{ color: "#f59e0b" }}>Exclusive VIP perks</strong></>
            )}
          </p>
          <Link href="/welcome" style={{
            padding: "12px 28px", borderRadius: 12,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0f1e", fontWeight: 700, textDecoration: "none", fontSize: 15, display: "inline-block",
          }}>{t("احصل على رابطك", "Get Your Link")}</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.04)", padding: "28px 24px",
        textAlign: "center", color: "rgba(248,250,252,0.3)", fontSize: 13,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 7,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 13, color: "#0a0f1e",
          }}>و</div>
          <strong style={{ color: "rgba(248,250,252,0.55)" }}>طيف · Tayf</strong>
        </div>
        © 2026 Tayf AI Workforce OS · {t("جميع الحقوق محفوظة", "All rights reserved")}
      </footer>
    </div>
  );
}
