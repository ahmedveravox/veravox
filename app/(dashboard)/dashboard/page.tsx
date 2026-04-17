import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

const AGENT_META: Record<string, { icon: string; label: string; color: string; bg: string; desc: string }> = {
  sales:        { icon: "💼", label: "موظف مبيعات",  color: "#4ade80", bg: "rgba(34,197,94,0.1)",   desc: "يقفل الصفقات ويرسل العروض" },
  support:      { icon: "💬", label: "خدمة عملاء",   color: "#60a5fa", bg: "rgba(59,130,246,0.1)",  desc: "رد فوري ودعم 24/7" },
  technical:    { icon: "🔧", label: "دعم فني",      color: "#c084fc", bg: "rgba(168,85,247,0.1)",  desc: "حل المشاكل التقنية" },
  marketing:    { icon: "🎨", label: "تسويق وإبداع", color: "#f472b6", bg: "rgba(236,72,153,0.1)",  desc: "حملات وأفكار إبداعية" },
  social:       { icon: "📱", label: "سوشال ميديا",  color: "#fcd34d", bg: "rgba(245,158,11,0.1)",  desc: "محتوى وتفاعل يومي" },
  analyst:      { icon: "📊", label: "محلل أعمال",   color: "#2dd4bf", bg: "rgba(20,184,166,0.1)",  desc: "تقارير وقرارات ذكية" },
  manager:      { icon: "🧠", label: "مدير AI",      color: "#f87171", bg: "rgba(239,68,68,0.1)",   desc: "إدارة وقرارات استراتيجية" },
  orders:       { icon: "📦", label: "موظف الطلبات", color: "#fb923c", bg: "rgba(249,115,22,0.1)",  desc: "متابعة الشحن والمرتجعات" },
  reservations: { icon: "📅", label: "الحجوزات",     color: "#818cf8", bg: "rgba(99,102,241,0.1)",  desc: "مواعيد وتأكيدات فورية" },
  invoices:     { icon: "🧾", label: "الفواتير",     color: "#facc15", bg: "rgba(234,179,8,0.1)",   desc: "فواتير ومتابعة المدفوعات" },
};

const ALL_AGENT_TYPES = Object.keys(AGENT_META);

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      business: { include: { agents: { orderBy: { agentType: "asc" } } } },
      subscription: true,
      conversations: {
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: { agent: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
    },
  });
  if (!user) redirect("/login");

  const activeAgents = user.business?.agents.filter(a => a.isActive) ?? [];

  const agentStats = await db.businessAgent.findMany({
    where: { businessId: user.business?.id ?? "", isActive: true },
    include: { _count: { select: { conversations: true } } },
  });

  const totalConversations = await db.conversation.count({ where: { userId: user.id } });
  const totalMessages = await db.message.count({ where: { conversation: { userId: user.id } } });

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayMessages = await db.message.count({
    where: { conversation: { userId: user.id }, createdAt: { gte: todayStart } },
  });

  const daysLeft = user.subscription
    ? Math.max(0, Math.ceil((new Date(user.subscription.trialEnds).getTime() - Date.now()) / 86400000))
    : 0;
  const isTrial = user.subscription?.status === "trial";
  const msgLimit = 200;
  const msgPct = isTrial ? Math.min(Math.round((totalMessages / msgLimit) * 100), 100) : 0;

  // Smart alerts
  const alerts: { type: string; msg: string; icon: string; color: string; href: string }[] = [];
  if (isTrial && totalMessages >= 160)
    alerts.push({ type: "upgrade", icon: "⚡", color: "#f59e0b", href: "/billing",
      msg: `اقتربت من حد التجربة (${totalMessages}/200 رسالة) — قرّب ترقية باقتك` });
  if (isTrial && daysLeft <= 2 && daysLeft > 0)
    alerts.push({ type: "trial", icon: "⏰", color: "#f87171", href: "/billing",
      msg: `تبقى ${daysLeft} ${daysLeft === 1 ? "يوم" : "أيام"} فقط في التجربة المجانية` });
  if (activeAgents.length === 0)
    alerts.push({ type: "noagent", icon: "🤖", color: "#c084fc", href: "/profile",
      msg: "لم تفعّل أي موظف AI بعد — ابدأ بتفعيل موظف مبيعات" });
  if (user.business && (!user.business.products || user.business.products.trim() === ""))
    alerts.push({ type: "profile", icon: "📝", color: "#60a5fa", href: "/profile",
      msg: "أضف منتجاتك وخدماتك حتى يرد AI بشكل صحيح" });
  if (todayMessages >= 20)
    alerts.push({ type: "hot", icon: "🔥", color: "#4ade80", href: `/chat/${activeAgents[0]?.id ?? ""}`,
      msg: `نشاط عالٍ اليوم! ${todayMessages} رسالة — موظفوك شغّالين` });

  const firstName = user.name.split(" ")[0];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }} className="page-content">

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#f0f4ff", margin: "0 0 4px", letterSpacing: "-0.5px" }}>
              مرحباً {firstName} 👋
            </h1>
            <p style={{ color: "rgba(240,244,255,0.4)", fontSize: 15, margin: 0 }}>
              {user.business?.name} · موظفوك يعملون الآن لأجلك
            </p>
          </div>
          {activeAgents.length > 0 && (
            <Link href={`/chat/${activeAgents[0].id}`} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 12,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#0a0f1e", fontWeight: 700, fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 4px 20px rgba(245,158,11,0.35)",
            }}>
              <span>💬</span> ابدأ محادثة
            </Link>
          )}
        </div>
      </div>

      {/* ── Smart Alerts ── */}
      {alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {alerts.map((a, i) => (
            <Link key={i} href={a.href} className="alert-banner" style={{
              background: `${a.color}07`,
              border: `1px solid ${a.color}25`,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: `${a.color}15`, border: `1px solid ${a.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>{a.icon}</div>
              <span style={{ fontSize: 14, color: a.color, fontWeight: 500, flex: 1 }}>{a.msg}</span>
              <span style={{ fontSize: 12, color: "rgba(240,244,255,0.25)", flexShrink: 0 }}>←</span>
            </Link>
          ))}
        </div>
      )}

      {/* ── Trial Banner ── */}
      {isTrial && (
        <div style={{
          background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.18)",
          borderRadius: 18, padding: "18px 22px", marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>⏰</span>
              <div>
                <span style={{ color: "#fcd34d", fontWeight: 700, fontSize: 15 }}>
                  تجربة مجانية — {daysLeft} {daysLeft === 1 ? "يوم" : "أيام"} متبقية
                </span>
                <span style={{ color: "rgba(240,244,255,0.35)", fontSize: 13, marginRight: 8 }}>
                  · {totalMessages}/{msgLimit} رسالة
                </span>
              </div>
            </div>
            <Link href="/billing" style={{
              padding: "8px 20px", borderRadius: 10,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#0a0f1e", fontWeight: 700, textDecoration: "none", fontSize: 13,
              boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
            }}>ترقية الآن ⚡</Link>
          </div>
          <div className="progress-bar">
            <div className={`progress-fill${msgPct >= 80 ? " danger" : ""}`} style={{ width: `${Math.max(msgPct, 2)}%` }}/>
          </div>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "موظفون نشطون",      value: activeAgents.length, icon: "🤖", color: "#f59e0b", sub: `من أصل ${ALL_AGENT_TYPES.length}` },
          { label: "رسائل اليوم",       value: todayMessages,       icon: "📨", color: "#22c55e", sub: "رسائل منذ منتصف الليل" },
          { label: "إجمالي المحادثات",  value: totalConversations,  icon: "💬", color: "#3b82f6", sub: "منذ إنشاء الحساب" },
          { label: "إجمالي الرسائل",    value: totalMessages,       icon: "📊", color: "#c084fc", sub: "عبر جميع الموظفين" },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: `${stat.color}15`, border: `1px solid ${stat.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>{stat.icon}</div>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: stat.color, boxShadow: `0 0 8px ${stat.color}`, marginTop: 4 }}/>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#f0f4ff", marginBottom: 2, letterSpacing: "-1px" }}>
              {stat.value}
            </div>
            <div style={{ color: "rgba(240,244,255,0.55)", fontSize: 13, fontWeight: 600 }}>{stat.label}</div>
            <div style={{ color: "rgba(240,244,255,0.25)", fontSize: 11, marginTop: 2 }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="main-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>

        {/* Active Agents */}
        <div style={{
          background: "rgba(12,19,38,0.85)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 22, padding: "22px", backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#f0f4ff" }}>موظفوك النشطون</h2>
            <Link href="/profile" style={{
              fontSize: 12, color: "#f59e0b", textDecoration: "none", fontWeight: 600,
              padding: "5px 12px", borderRadius: 8,
              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)",
            }}>إدارة الفريق</Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeAgents.map(agent => {
              const meta = AGENT_META[agent.agentType] ?? { icon: "🤖", label: agent.agentType, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", desc: "" };
              const stat = agentStats.find(s => s.id === agent.id);
              const convCount = stat?._count.conversations ?? 0;
              return (
                <Link key={agent.id} href={`/chat/${agent.id}`} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 14,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14,
                    background: meta.bg, border: `1px solid ${meta.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, flexShrink: 0,
                    boxShadow: `0 0 20px ${meta.color}10`,
                  }}>{meta.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#f0f4ff", marginBottom: 2 }}>{meta.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(240,244,255,0.35)" }}>
                      {meta.desc}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}/>
                      <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>نشط</span>
                    </div>
                    <span style={{ fontSize: 11, color: "rgba(240,244,255,0.25)" }}>{convCount} محادثة</span>
                  </div>
                </Link>
              );
            })}

            {/* Add agent slot */}
            {activeAgents.length < (user.subscription?.maxAgents ?? 1) && (
              <Link href="/profile" style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 14,
                background: "rgba(245,158,11,0.03)",
                border: "1px dashed rgba(245,158,11,0.2)",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: "rgba(245,158,11,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0, color: "#f59e0b",
                }}>+</div>
                <div style={{ color: "rgba(245,158,11,0.7)", fontSize: 14, fontWeight: 600 }}>
                  أضف موظفاً من فريقك
                </div>
              </Link>
            )}

            {activeAgents.length === 0 && (
              <div style={{ textAlign: "center", padding: "28px 0", color: "rgba(240,244,255,0.3)", fontSize: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                لم تفعّل أي موظف بعد<br/>
                <Link href="/profile" style={{ color: "#f59e0b", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
                  اضغط هنا لتفعيل موظفيك ←
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Recent Conversations */}
          <div style={{
            background: "rgba(12,19,38,0.85)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 22, padding: "22px",
          }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 800, color: "#f0f4ff" }}>آخر المحادثات</h2>
            {user.conversations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(240,244,255,0.3)", fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                لا توجد محادثات بعد<br/>
                <span style={{ fontSize: 13 }}>ابدأ مع أحد موظفيك</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {user.conversations.map(conv => {
                  const meta = AGENT_META[conv.agent.agentType] ?? { icon: "🤖", label: conv.agent.agentType, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", desc: "" };
                  const lastMsg = conv.messages[0];
                  return (
                    <Link key={conv.id} href={`/chat/${conv.agentId}`} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", borderRadius: 12,
                      background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)",
                      textDecoration: "none", transition: "all 0.15s ease",
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: meta.bg, border: `1px solid ${meta.color}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 17, flexShrink: 0,
                      }}>{meta.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#f0f4ff", marginBottom: 1 }}>{meta.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(240,244,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {lastMsg?.content?.slice(0, 50) ?? "..."}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(240,244,255,0.2)", flexShrink: 0 }}>
                        {new Date(conv.updatedAt).toLocaleDateString("ar-SA")}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Agent Performance */}
          {agentStats.length > 0 && (
            <div style={{
              background: "rgba(12,19,38,0.85)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 22, padding: "22px",
            }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 800, color: "#f0f4ff" }}>📊 أداء الموظفين</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {agentStats.sort((a, b) => b._count.conversations - a._count.conversations).map(stat => {
                  const meta = AGENT_META[stat.agentType] ?? { icon: "🤖", label: stat.agentType, color: "#f59e0b", bg: "", desc: "" };
                  const max = Math.max(...agentStats.map(s => s._count.conversations), 1);
                  const pct = (stat._count.conversations / max) * 100;
                  return (
                    <div key={stat.id}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, color: "rgba(240,244,255,0.65)", display: "flex", alignItems: "center", gap: 7 }}>
                          <span>{meta.icon}</span> {meta.label}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>
                          {stat._count.conversations}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div style={{
                          height: "100%", borderRadius: 6,
                          background: `linear-gradient(90deg, ${meta.color}, ${meta.color}70)`,
                          width: `${Math.max(pct, 3)}%`,
                          transition: "width 0.6s ease",
                        }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Unlock All Agents CTA ── */}
      {activeAgents.length < ALL_AGENT_TYPES.length && (
        <div style={{
          marginTop: 22, borderRadius: 22, padding: "28px 32px",
          background: "linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(99,102,241,0.04) 100%)",
          border: "1px solid rgba(245,158,11,0.13)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 18,
        }}>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: "#f0f4ff" }}>
              أطلق قدرة فريقك الكاملة 🚀
            </h3>
            <p style={{ margin: 0, color: "rgba(240,244,255,0.45)", fontSize: 14 }}>
              {ALL_AGENT_TYPES.length - activeAgents.length} موظف AI لم تفعّلهم بعد — كل واحد يعمل 24/7 بدلاً عنك
            </p>
            {/* Agent type chips */}
            <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
              {Object.entries(AGENT_META)
                .filter(([k]) => !activeAgents.find(a => a.agentType === k))
                .slice(0, 5)
                .map(([k, m]) => (
                  <span key={k} style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 12,
                    background: `${m.color}10`, border: `1px solid ${m.color}20`,
                    color: m.color, fontWeight: 500,
                  }}>{m.icon} {m.label}</span>
                ))}
            </div>
          </div>
          <Link href="/billing" style={{
            padding: "13px 28px", borderRadius: 14,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0f1e", fontWeight: 800, textDecoration: "none", fontSize: 15,
            boxShadow: "0 6px 24px rgba(245,158,11,0.35)", flexShrink: 0,
          }}>ترقية الباقة ←</Link>
        </div>
      )}
    </div>
  );
}
