import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

const AGENT_META: Record<string, { icon: string; label: string; color: string }> = {
  sales:        { icon: "💼", label: "موظف مبيعات", color: "#4ade80" },
  support:      { icon: "💬", label: "خدمة عملاء", color: "#60a5fa" },
  technical:    { icon: "🔧", label: "دعم فني", color: "#c084fc" },
  marketing:    { icon: "🎨", label: "تسويق", color: "#f472b6" },
  social:       { icon: "📱", label: "سوشال ميديا", color: "#fcd34d" },
  analyst:      { icon: "📊", label: "محلل أعمال", color: "#2dd4bf" },
  manager:      { icon: "🧠", label: "مدير AI", color: "#f87171" },
  orders:       { icon: "📦", label: "الطلبات", color: "#fb923c" },
  reservations: { icon: "📅", label: "الحجوزات", color: "#818cf8" },
  invoices:     { icon: "🧾", label: "الفواتير", color: "#facc15" },
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

  // Per-agent conversation counts
  const agentStats = await db.businessAgent.findMany({
    where: { businessId: user.business?.id ?? "", isActive: true },
    include: { _count: { select: { conversations: true } } },
  });

  const totalConversations = await db.conversation.count({ where: { userId: user.id } });
  const totalMessages = await db.message.count({
    where: { conversation: { userId: user.id } },
  });

  // Today's messages
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayMessages = await db.message.count({
    where: { conversation: { userId: user.id }, createdAt: { gte: todayStart } },
  });

  const daysLeft = user.subscription
    ? Math.max(0, Math.ceil((new Date(user.subscription.trialEnds).getTime() - Date.now()) / 86400000))
    : 0;
  const isTrial = user.subscription?.status === "trial";
  const msgLimit = 200;
  const msgPct = isTrial ? Math.min(Math.round((totalMessages / msgLimit) * 100), 100) : 0;

  // ── Smart alerts ────────────────────────────────────────────────────
  const alerts: { type: string; msg: string; icon: string; color: string; href: string }[] = [];

  if (isTrial && totalMessages >= 160) {
    alerts.push({ type: "upgrade", icon: "⚡", color: "#f59e0b", href: "/billing",
      msg: `اقتربت من حد التجربة (${totalMessages}/200 رسالة) — قرّب ترقية باقتك` });
  }
  if (isTrial && daysLeft <= 2 && daysLeft > 0) {
    alerts.push({ type: "trial", icon: "⏰", color: "#f87171", href: "/billing",
      msg: `تبقى ${daysLeft} ${daysLeft === 1 ? "يوم" : "أيام"} فقط في التجربة المجانية` });
  }
  if (activeAgents.length === 0) {
    alerts.push({ type: "noagent", icon: "🤖", color: "#c084fc", href: "/profile",
      msg: "لم تفعّل أي موظف AI بعد — ابدأ بتفعيل موظف مبيعات" });
  }
  if (user.business && (!user.business.products || user.business.products.trim() === "")) {
    alerts.push({ type: "profile", icon: "📝", color: "#60a5fa", href: "/profile",
      msg: "أضف منتجاتك وخدماتك حتى يرد AI بشكل صحيح" });
  }
  // High activity alert
  if (todayMessages >= 20) {
    alerts.push({ type: "hot", icon: "🔥", color: "#4ade80", href: "/chat/" + (activeAgents[0]?.id ?? ""),
      msg: `نشاط عالٍ اليوم! ${todayMessages} رسالة — موظفوك شغّالين` });
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f8fafc", margin: "0 0 6px" }}>
          مرحباً {user.name.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 15, margin: 0 }}>
          {user.business?.name} · موظفوك يعملون الآن
        </p>
      </div>

      {/* Smart Alerts */}
      {alerts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {alerts.map((a, i) => (
            <Link key={i} href={a.href} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 18px", borderRadius: 12, textDecoration: "none",
              background: `${a.color}08`, border: `1px solid ${a.color}30`,
              transition: "all 0.15s ease",
            }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <span style={{ fontSize: 14, color: a.color, fontWeight: 500, flex: 1 }}>{a.msg}</span>
              <span style={{ fontSize: 12, color: "rgba(248,250,252,0.3)" }}>←</span>
            </Link>
          ))}
        </div>
      )}

      {/* Trial banner */}
      {isTrial && (
        <div style={{
          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 16, padding: "16px 20px", marginBottom: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
            <span style={{ color: "#fcd34d", fontWeight: 600, fontSize: 15 }}>
              ⏰ تجربة مجانية — {daysLeft} {daysLeft === 1 ? "يوم" : "أيام"} متبقية · {totalMessages}/{msgLimit} رسالة
            </span>
            <Link href="/billing" style={{
              padding: "7px 18px", borderRadius: 8,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#0a0f1e", fontWeight: 700, textDecoration: "none", fontSize: 13,
            }}>ترقية الآن</Link>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
            <div style={{
              height: "100%", borderRadius: 4,
              background: msgPct >= 80 ? "linear-gradient(90deg, #ef4444, #f87171)" : "linear-gradient(90deg, #f59e0b, #fcd34d)",
              width: `${Math.max(msgPct, 2)}%`, transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "موظفون نشطون", value: activeAgents.length, icon: "🤖", color: "#f59e0b" },
          { label: "رسائل اليوم", value: todayMessages, icon: "📨", color: "#22c55e" },
          { label: "إجمالي المحادثات", value: totalConversations, icon: "💬", color: "#3b82f6" },
          { label: "إجمالي الرسائل", value: totalMessages, icon: "📊", color: "#c084fc" },
        ].map((stat, i) => (
          <div key={i} style={{
            background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: "20px 22px",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{stat.icon}</span>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: stat.color, boxShadow: `0 0 8px ${stat.color}` }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>{stat.value}</div>
            <div style={{ color: "rgba(248,250,252,0.45)", fontSize: 13 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Active Agents */}
        <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#f8fafc" }}>موظفوك النشطون</h2>
            <Link href="/profile" style={{ fontSize: 13, color: "#f59e0b", textDecoration: "none" }}>إدارة</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeAgents.map(agent => {
              const meta = AGENT_META[agent.agentType] ?? { icon: "🤖", label: agent.agentType, color: "#f59e0b" };
              const stat = agentStats.find(s => s.id === agent.id);
              const convCount = stat?._count.conversations ?? 0;
              return (
                <Link key={agent.id} href={`/chat/${agent.id}`} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 12,
                  background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.05)",
                  textDecoration: "none", transition: "all 0.15s ease",
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${meta.color}18`, border: `1px solid ${meta.color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                  }}>{meta.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#f8fafc", marginBottom: 2 }}>{meta.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>
                      {convCount} محادثة · جاهز
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
                  </div>
                </Link>
              );
            })}

            {activeAgents.length < (user.subscription?.maxAgents ?? 1) && (
              <Link href="/profile" style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 12,
                background: "rgba(245,158,11,0.04)", border: "1px dashed rgba(245,158,11,0.25)",
                textDecoration: "none",
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: "rgba(245,158,11,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>+</div>
                <div style={{ color: "rgba(245,158,11,0.8)", fontSize: 14, fontWeight: 500 }}>
                  أضف موظفاً جديداً
                </div>
              </Link>
            )}

            {activeAgents.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(248,250,252,0.35)", fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🤖</div>
                لم تفعّل أي موظف بعد<br />
                <Link href="/profile" style={{ color: "#f59e0b", fontSize: 13, textDecoration: "none" }}>اضغط هنا لتفعيل موظفيك</Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Recent Conversations + Agent Performance */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Recent Conversations */}
          <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "22px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 700, color: "#f8fafc" }}>آخر المحادثات</h2>
            {user.conversations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "rgba(248,250,252,0.35)", fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                لا توجد محادثات بعد<br />
                <span style={{ fontSize: 13 }}>ابدأ مع أحد موظفيك</span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {user.conversations.map(conv => {
                  const meta = AGENT_META[conv.agent.agentType] ?? { icon: "🤖", label: conv.agent.agentType, color: "#f59e0b" };
                  const lastMsg = conv.messages[0];
                  return (
                    <Link key={conv.id} href={`/chat/${conv.agentId}`} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", borderRadius: 10,
                      background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.04)",
                      textDecoration: "none",
                    }}>
                      <span style={{ fontSize: 20 }}>{meta.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#f8fafc" }}>{meta.label}</div>
                        <div style={{
                          fontSize: 11, color: "rgba(248,250,252,0.4)",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {lastMsg?.content?.slice(0, 45) ?? "..."}
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(248,250,252,0.25)", flexShrink: 0 }}>
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
            <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "22px" }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>📊 أداء الموظفين</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {agentStats.sort((a,b) => b._count.conversations - a._count.conversations).map(stat => {
                  const meta = AGENT_META[stat.agentType] ?? { icon: "🤖", label: stat.agentType, color: "#f59e0b" };
                  const max = Math.max(...agentStats.map(s => s._count.conversations), 1);
                  const pct = max > 0 ? (stat._count.conversations / max) * 100 : 0;
                  return (
                    <div key={stat.id}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: "rgba(248,250,252,0.7)", display: "flex", alignItems: "center", gap: 6 }}>
                          <span>{meta.icon}</span> {meta.label}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>
                          {stat._count.conversations} محادثة
                        </span>
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>
                        <div style={{
                          height: "100%", borderRadius: 4,
                          background: `linear-gradient(90deg, ${meta.color}, ${meta.color}80)`,
                          width: `${Math.max(pct, 3)}%`,
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unlock all agents */}
      {activeAgents.length < ALL_AGENT_TYPES.length && (
        <div style={{
          marginTop: 24, borderRadius: 20, padding: "24px 28px",
          background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#f8fafc" }}>
              أطلق قدرة فريقك الكاملة 🚀
            </h3>
            <p style={{ margin: 0, color: "rgba(248,250,252,0.5)", fontSize: 14 }}>
              {ALL_AGENT_TYPES.length - activeAgents.length} موظف AI لم تفعّلهم بعد — كل موظف يعمل 24/7 بدلاً عنك
            </p>
          </div>
          <Link href="/billing" style={{
            padding: "11px 24px", borderRadius: 10,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0f1e", fontWeight: 700, textDecoration: "none", fontSize: 15,
          }}>ترقية الباقة</Link>
        </div>
      )}
    </div>
  );
}
