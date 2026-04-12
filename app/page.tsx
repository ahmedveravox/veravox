"use client";
import Link from "next/link";
import { useState } from "react";

const AGENTS = [
  { icon: "💼", title: "موظف مبيعات AI", desc: "يقفل صفقات، يرسل عروض، يتابع العملاء المترددين بأسلوبك", color: "agent-sales" },
  { icon: "💬", title: "خدمة العملاء + ترجمة", desc: "رد 24/7، دعم كامل، ترجمة تلقائية لكل اللغات واللهجات", color: "agent-support" },
  { icon: "🔧", title: "دعم فني AI", desc: "يحل المشاكل التقنية، يعالج الأعطال، يصعّد عند الحاجة", color: "agent-technical" },
  { icon: "🎨", title: "تسويق وإبداع", desc: "يكتب حملات، يصمم إعلانات، يقترح أفكار بيع جديدة", color: "agent-marketing" },
  { icon: "📱", title: "سوشال ميديا", desc: "يرد على التعليقات، ينشر محتوى، يدير حملاتك اليومية", color: "agent-social" },
  { icon: "📊", title: "محلل أعمال AI", desc: "تقارير مبيعات، سلوك العملاء، تحليل أداء يومي وأسبوعي", color: "agent-analyst" },
  { icon: "🧠", title: "مدير AI", desc: "يدير الموظفين، يحدد الأولويات، يقترح نمو للنشاط", color: "agent-manager" },
  { icon: "📦", title: "موظف الطلبات", desc: "متابعة الشحن، تحديث الحالة، إدارة المرتجعات", color: "agent-orders" },
  { icon: "📅", title: "موظف الحجوزات", desc: "يحجز مواعيد، يؤكد، يذكّر عملاءك تلقائياً", color: "agent-reservations" },
  { icon: "🧾", title: "الفواتير والمدفوعات", desc: "يرسل فواتير، يتابع الدفع، يرسل تنبيهات التأخير", color: "agent-invoices" },
];

const PLANS = [
  { name: "البداية", price: 199, agents: 1, color: "#22c55e", popular: false, features: ["موظف AI واحد", "اختيار الوظيفة", "7 أيام تجريبية"] },
  { name: "الفريق الأساسي", price: 299, agents: 3, color: "#3b82f6", popular: false, features: ["3 موظفين AI", "لوحة تحكم", "تقارير أسبوعية"] },
  { name: "النمو", price: 499, agents: 5, color: "#f59e0b", popular: true, features: ["5 موظفين AI", "محلل أعمال", "تنبيهات ذكية", "أولوية الدعم"] },
  { name: "الأعمال", price: 999, agents: 10, color: "#ef4444", popular: false, features: ["جميع الموظفين", "مدير AI", "محلل أعمال", "تكاملات متقدمة"] },
];

export default function LandingPage() {
  const [activeAgent, setActiveAgent] = useState(0);

  return (
    <div className="geo-bg min-h-screen" style={{ fontFamily: "var(--font-arabic), sans-serif" }}>
      {/* ── Navbar ── */}
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,15,30,0.85)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 50,
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 16, color: "#0a0f1e",
          }}>V</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#f8fafc" }}>Veravox</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/login" style={{
            color: "rgba(248,250,252,0.7)", textDecoration: "none",
            fontSize: 14, fontWeight: 500,
          }}>تسجيل الدخول</Link>
          <Link href="/register" style={{
            padding: "9px 22px", borderRadius: 10,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0f1e", fontWeight: 700, textDecoration: "none",
            fontSize: 14, transition: "all 0.2s ease",
          }}>ابدأ مجاناً</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ textAlign: "center", padding: "90px 24px 70px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 50, padding: "6px 16px", marginBottom: 28,
          fontSize: 13, color: "#fcd34d",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
          النظام الوحيد في المنطقة العربية
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 800,
          lineHeight: 1.2, margin: "0 0 20px",
          color: "#f8fafc",
        }}>
          فريق موظفين{" "}
          <span style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #fcd34d 50%, #f59e0b 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>ذكاء اصطناعي</span>
          <br />يشتغل بدل فريقك الحقيقي
        </h1>

        <p style={{ color: "rgba(248,250,252,0.6)", fontSize: "clamp(15px, 2.5vw, 20px)", maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.8 }}>
          مبيعات، خدمة عملاء، تسويق، تحليل، حجوزات، وأكثر –
          كل هذا بموظفين AI يعملون 24/7 بلهجتك وأسلوب نشاطك
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{
            padding: "15px 36px", borderRadius: 12,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0f1e", fontWeight: 700, textDecoration: "none",
            fontSize: 17, boxShadow: "0 8px 30px rgba(245,158,11,0.3)",
            transition: "all 0.2s ease",
          }}>🚀 ابدأ 7 أيام مجاناً</Link>
          <a href="#agents" style={{
            padding: "15px 36px", borderRadius: 12,
            border: "1px solid rgba(245,158,11,0.3)",
            color: "#f59e0b", fontWeight: 600, textDecoration: "none",
            fontSize: 17, background: "transparent",
          }}>اكتشف الموظفين</a>
        </div>

        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 52, flexWrap: "wrap" }}>
          {[["10+", "موظف AI"], ["24/7", "تشغيل مستمر"], ["200+", "رسالة تجريبية"], ["7 أيام", "مجاناً"]].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#f59e0b" }}>{n}</div>
              <div style={{ fontSize: 13, color: "rgba(248,250,252,0.5)", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Agents ── */}
      <section id="agents" style={{ padding: "70px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: "#f8fafc", margin: "0 0 12px" }}>
            فريقك الكامل من الموظفين AI
          </h2>
          <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 17 }}>كل موظف متخصص في مجاله، يعمل بلهجتك وأسلوب نشاطك</p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}>
          {AGENTS.map((agent, i) => (
            <div
              key={i}
              onMouseEnter={() => setActiveAgent(i)}
              style={{
                background: activeAgent === i ? "rgba(245,158,11,0.06)" : "rgba(30,41,59,0.8)",
                border: activeAgent === i ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: "22px 20px",
                cursor: "default",
                transition: "all 0.2s ease",
                transform: activeAgent === i ? "translateY(-3px)" : "none",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{agent.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#f8fafc", marginBottom: 8 }}>{agent.title}</div>
              <p style={{ color: "rgba(248,250,252,0.55)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{agent.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "70px 24px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, color: "#f8fafc", margin: "0 0 12px" }}>
          كيف يبدأ نشاطك؟
        </h2>
        <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 17, marginBottom: 48 }}>3 خطوات وفريقك جاهز</p>
        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { step: "1", icon: "📋", title: "عرّف نشاطك", desc: "أدخل اسم النشاط، نوعه، منتجاتك، وسياسة البيع" },
            { step: "2", icon: "🤖", title: "اختر موظفيك", desc: "اختر الموظفين AI المناسبين لنشاطك من 10 تخصصات" },
            { step: "3", icon: "🚀", title: "شغّل وراقب", desc: "موظفوك يبدأون العمل فوراً، تابع الأداء من لوحة التحكم" },
          ].map((item, i) => (
            <div key={i} style={{
              flex: "1 1 220px", maxWidth: 260,
              background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: "32px 24px", textAlign: "center",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, fontWeight: 800, color: "#0a0f1e",
                margin: "0 auto 16px",
              }}>{item.step}</div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#f8fafc", marginBottom: 8 }}>{item.title}</div>
              <p style={{ color: "rgba(248,250,252,0.55)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: "70px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, color: "#f8fafc", margin: "0 0 12px" }}>
            باقات تناسب كل نشاط
          </h2>
          <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 17 }}>ابدأ مجاناً لمدة 7 أيام، لا بطاقة مطلوبة</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 20 }}>
          {PLANS.map((plan, i) => (
            <div key={i} style={{
              background: plan.popular ? "rgba(245,158,11,0.05)" : "rgba(30,41,59,0.8)",
              border: plan.popular ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: "28px 24px",
              position: "relative",
              boxShadow: plan.popular ? "0 0 40px rgba(245,158,11,0.1)" : "none",
            }}>
              {plan.popular && (
                <div style={{
                  position: "absolute", top: -12, right: 20,
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#0a0f1e", fontSize: 12, fontWeight: 700,
                  padding: "3px 12px", borderRadius: 20,
                }}>الأكثر طلباً</div>
              )}
              <div style={{ color: plan.color, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{plan.name}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: "#f8fafc" }}>{plan.price}</span>
                <span style={{ color: "rgba(248,250,252,0.5)", fontSize: 14 }}>ريال/شهر</span>
              </div>
              <div style={{ color: "rgba(248,250,252,0.4)", fontSize: 13, marginBottom: 20 }}>
                {plan.agents === 10 ? "جميع الموظفين" : `${plan.agents} موظف${plan.agents > 1 ? "ين" : ""} AI`}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                {plan.features.map((f, fi) => (
                  <li key={fi} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(248,250,252,0.75)" }}>
                    <span style={{ color: plan.popular ? "#f59e0b" : "#22c55e", fontSize: 16 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" style={{
                display: "block", textAlign: "center",
                padding: "11px 0", borderRadius: 10,
                background: plan.popular ? "linear-gradient(135deg, #f59e0b, #d97706)" : "transparent",
                border: plan.popular ? "none" : "1px solid rgba(245,158,11,0.3)",
                color: plan.popular ? "#0a0f1e" : "#f59e0b",
                fontWeight: 700, textDecoration: "none", fontSize: 15,
                transition: "all 0.2s ease",
              }}>ابدأ الآن</Link>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: "center", marginTop: 28,
          color: "rgba(248,250,252,0.4)", fontSize: 14,
        }}>
          موظف إضافي: <span style={{ color: "#f59e0b" }}>+49 ريال</span> (أول 3) أو <span style={{ color: "#f59e0b" }}>+79 ريال</span> (بعد ذلك)
        </div>
      </section>

      {/* ── Referral CTA ── */}
      <section style={{ padding: "50px 24px", maxWidth: 760, margin: "0 auto" }}>
        <div style={{
          background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 24, padding: "40px 36px", textAlign: "center",
        }}>
          <div style={{ fontSize: 42, marginBottom: 16 }}>🔁</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#f8fafc", margin: "0 0 12px" }}>
            سوِّق واربح 🔥
          </h2>
          <p style={{ color: "rgba(248,250,252,0.6)", fontSize: 16, lineHeight: 1.8, margin: "0 0 28px" }}>
            جيب عميل واحد = <strong style={{ color: "#f59e0b" }}>30 ريال رصيد</strong> مباشرة<br />
            5 عملاء = <strong style={{ color: "#f59e0b" }}>موظف AI مجاني شهر كامل</strong><br />
            10 عملاء = <strong style={{ color: "#f59e0b" }}>مزايا حصرية قوية</strong>
          </p>
          <Link href="/register" style={{
            padding: "13px 32px", borderRadius: 12,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0f1e", fontWeight: 700, textDecoration: "none",
            fontSize: 16, display: "inline-block",
          }}>احصل على رابطك الآن</Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "32px 24px",
        textAlign: "center",
        color: "rgba(248,250,252,0.35)",
        fontSize: 14,
      }}>
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 12, color: "#0a0f1e",
          }}>V</div>
          <strong style={{ color: "rgba(248,250,252,0.6)" }}>Veravox</strong>
        </div>
        © 2026 Veravox – AI Workforce OS. جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
