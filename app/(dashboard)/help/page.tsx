"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const FAQS = [
  { q: "كيف أبدأ محادثة مع موظف AI؟", a: "اذهب للوحة التحكم، واختر الموظف الذي تريد التحدث معه. سيفتح نافذة المحادثة مباشرة." },
  { q: "كيف أضيف أو أغير موظف AI؟", a: "من صفحة 'نشاطي'، يمكنك تفعيل أو تعطيل أي موظف بنقرة واحدة. باقتك تحدد عدد الموظفين المتاحين." },
  { q: "هل المحادثات محفوظة؟", a: "نعم، جميع المحادثات محفوظة في حسابك ويمكنك العودة إليها في أي وقت." },
  { q: "كيف أجعل AI يتكلم بأسلوب نشاطي؟", a: "من صفحة 'نشاطي'، أدخل معلومات نشاطك: المنتجات، السياسات، اللهجة، نبرة التواصل. AI سيستخدمها تلقائياً." },
  { q: "ما الفرق بين الباقات؟", a: "الفرق الأساسي هو عدد الموظفين. البداية (1 موظف)، الفريق (3)، النمو (5)، الأعمال (10 موظفين + مدير ومحلل)." },
  { q: "كيف أنتفع من نظام الإحالة؟", a: "من صفحة 'سوِّق واربح'، انسخ رابطك الخاص وشاركه مع أصحاب الأعمال. ستحصل على 30 ريال عن كل عميل يشترك." },
  { q: "هل يعمل AI بدون إنترنت؟", a: "لا، يتطلب AI اتصالاً بالإنترنت لمعالجة الرسائل. لكن يمكنك استخدام المنصة من أي مكان وأي جهاز." },
  { q: "كيف أغير كلمة المرور؟", a: "حالياً يمكنك التواصل مع الدعم لتغيير كلمة المرور. سنضيف هذه الخاصية قريباً في الإعدادات." },
];

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function HelpPage() {
  const [tab, setTab] = useState<"faq" | "ticket">("faq");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/support").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setTickets(data);
    });
  }, [sent]);

  async function submitTicket() {
    if (!subject.trim() || !message.trim()) { setError("يرجى ملء جميع الحقول"); return; }
    setSending(true);
    setError("");
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message, priority }),
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
      setSubject("");
      setMessage("");
      setTimeout(() => setSent(false), 4000);
    } else {
      setError("حدث خطأ، حاول مرة أخرى");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)",
    color: "#f8fafc", fontSize: 14, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const STATUS_LABELS: Record<string, [string, string]> = {
    open: ["مفتوحة", "#f87171"],
    in_progress: ["قيد المعالجة", "#fcd34d"],
    resolved: ["محلولة", "#4ade80"],
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: "0 0 6px" }}>🎫 المساعدة والدعم</h1>
        <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 14, margin: 0 }}>الأسئلة الشائعة وتواصل مع الفريق</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { id: "faq", label: "❓ الأسئلة الشائعة" },
          { id: "ticket", label: "📩 تواصل معنا" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as "faq" | "ticket")} style={{
            padding: "10px 20px", borderRadius: 10,
            background: tab === t.id ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(30,41,59,0.8)",
            color: tab === t.id ? "#0a0f1e" : "rgba(248,250,252,0.6)",
            fontWeight: tab === t.id ? 700 : 400, fontSize: 14,
            cursor: "pointer", fontFamily: "inherit",
            border: tab === t.id ? "none" : "1px solid rgba(255,255,255,0.06)",
          }}>{t.label}</button>
        ))}
      </div>

      {tab === "faq" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{
              background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14, overflow: "hidden",
            }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: "100%", padding: "16px 20px",
                background: "transparent", border: "none",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                color: "#f8fafc", fontWeight: 600, fontSize: 15, cursor: "pointer",
                fontFamily: "inherit", textAlign: "right",
              }}>
                <span>{faq.q}</span>
                <span style={{
                  fontSize: 18, color: "#f59e0b", flexShrink: 0, marginRight: 10,
                  transform: openFaq === i ? "rotate(45deg)" : "none",
                  transition: "transform 0.2s ease",
                }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{
                  padding: "0 20px 16px",
                  color: "rgba(248,250,252,0.6)", fontSize: 14, lineHeight: 1.7,
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                }}>{faq.a}</div>
              )}
            </div>
          ))}

          {/* Quick links */}
          <div style={{
            marginTop: 16,
            background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: 16, padding: "20px",
          }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>روابط سريعة</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "إدارة الموظفين", href: "/profile" },
                { label: "الباقات", href: "/billing" },
                { label: "سوِّق واربح", href: "/referral" },
                { label: "لوحة التحكم", href: "/dashboard" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{
                  padding: "8px 16px", borderRadius: 8,
                  background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                  color: "#fcd34d", textDecoration: "none", fontSize: 13, fontWeight: 500,
                }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "ticket" && (
        <div>
          {/* Submit ticket */}
          <div style={{
            background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 20, padding: "28px", marginBottom: 24,
          }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: "#f8fafc" }}>
              أرسل طلب دعم
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>الموضوع</label>
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="مثال: مشكلة في الموظف AI" style={inputStyle} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, color: "rgba(248,250,252,0.6)", marginBottom: 6 }}>الرسالة</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
                  placeholder="اشرح مشكلتك أو سؤالك بالتفصيل..." style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, color: "rgba(248,250,252,0.6)", marginBottom: 8 }}>الأولوية</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["low", "منخفضة"], ["normal", "عادية"], ["high", "عالية"]].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setPriority(v)} style={{
                      flex: 1, padding: "9px 8px", borderRadius: 8, fontFamily: "inherit",
                      background: priority === v ? "rgba(245,158,11,0.15)" : "rgba(15,23,42,0.8)",
                      border: priority === v ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.06)",
                      color: priority === v ? "#fcd34d" : "rgba(248,250,252,0.6)",
                      fontSize: 13, cursor: "pointer",
                    }}>{l}</button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 13 }}>{error}</div>
              )}
              {sent && (
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", color: "#4ade80", fontSize: 13 }}>
                  ✓ تم إرسال طلبك بنجاح! سيرد عليك الفريق في أقرب وقت
                </div>
              )}

              <button onClick={submitTicket} disabled={sending} style={{
                padding: "13px", borderRadius: 12, border: "none",
                background: sending ? "rgba(245,158,11,0.4)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                color: "#0a0f1e", fontWeight: 700, fontSize: 15,
                cursor: sending ? "wait" : "pointer", fontFamily: "inherit",
              }}>
                {sending ? "جاري الإرسال..." : "📩 إرسال الطلب"}
              </button>
            </div>
          </div>

          {/* Previous tickets */}
          {tickets.length > 0 && (
            <div style={{
              background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 20, padding: "24px",
            }}>
              <h2 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>طلباتك السابقة</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tickets.map(t => {
                  const [statusLabel, statusColor] = STATUS_LABELS[t.status] ?? ["—", "#94a3b8"];
                  return (
                    <div key={t.id} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", borderRadius: 12,
                      background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.04)",
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc" }}>{t.subject}</div>
                        <div style={{ fontSize: 12, color: "rgba(248,250,252,0.35)", marginTop: 2 }}>
                          {new Date(t.createdAt).toLocaleDateString("ar-SA")}
                        </div>
                      </div>
                      <span style={{
                        padding: "3px 12px", borderRadius: 20, fontSize: 12,
                        background: `${statusColor}15`, color: statusColor,
                        border: `1px solid ${statusColor}30`,
                      }}>{statusLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
