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
  const totalConversations = await db.conversation.count({ where: { userId: user.id } });
  const totalMessages = await db.message.count({
    where: { conversation: { userId: user.id } },
  });
  const daysLeft = user.subscription
    ? Math.max(0, Math.ceil((new Date(user.subscription.trialEnds).getTime() - Date.now()) / 86400000))
    : 0;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#f8fafc", margin: "0 0 6px" }}>
          مرحباً {user.name.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "rgba(248,250,252,0.5)", fontSize: 15, margin: 0 }}>
          {user.business?.name} · موظفوك يعملون الآن
        </p>
      </div>

      {/* Trial banner */}
      {user.subscription?.status === "trial" && (
        <div style={{
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 14, padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>⏰</span>
            <span style={{ color: "#fcd34d", fontWeight: 600, fontSize: 15 }}>
              تجربة مجانية: {daysLeft} {daysLeft === 1 ? "يوم" : "أيام"} متبقية
            </span>
          </div>
          <Link href="/billing" style={{
            padding: "8px 18px", borderRadius: 8,
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0f1e", fontWeight: 700, textDecoration: "none", fontSize: 14,
          }}>ترقية الآن</Link>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "موظفون نشطون", value: activeAgents.length, icon: "🤖", color: "#f59e0b" },
          { label: "إجمالي المحادثات", value: totalConversations, icon: "💬", color: "#3b82f6" },
          { label: "إجمالي الرسائل", value: totalMessages, icon: "📨", color: "#22c55e" },
          { label: "باقتك الحالية", value: user.subscription?.plan === "trial" ? "تجريبية" : user.subscription?.plan ?? "—", icon: "⭐", color: "#c084fc" },
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
              return (
                <Link key={agent.id} href={`/chat/${agent.id}`} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 12,
                  background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.05)",
                  textDecoration: "none", transition: "all 0.15s ease",
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: `${meta.color}18`,
                    border: `1px solid ${meta.color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, flexShrink: 0,
                  }}>{meta.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#f8fafc", marginBottom: 2 }}>{meta.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>جاهز للمحادثة</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                </Link>
              );
            })}

            {/* Add agent slots */}
            {activeAgents.length < (user.subscription?.maxAgents ?? 1) && (
              <Link href="/profile" style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 12,
                background: "rgba(245,158,11,0.04)",
                border: "1px dashed rgba(245,158,11,0.25)",
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
          </div>
        </div>

        {/* Recent Conversations */}
        <div style={{ background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "22px" }}>
          <h2 style={{ margin: "0 0 18px", fontSize: 17, fontWeight: 700, color: "#f8fafc" }}>آخر المحادثات</h2>
          {user.conversations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "rgba(248,250,252,0.35)", fontSize: 14 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
              لا توجد محادثات بعد<br />
              <span style={{ fontSize: 13 }}>ابدأ محادثة مع أحد موظفيك</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {user.conversations.map(conv => {
                const meta = AGENT_META[conv.agent.agentType] ?? { icon: "🤖", label: conv.agent.agentType, color: "#f59e0b" };
                const lastMsg = conv.messages[0];
                return (
                  <Link key={conv.id} href={`/chat/${conv.agentId}`} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 12,
                    background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.05)",
                    textDecoration: "none",
                  }}>
                    <span style={{ fontSize: 22 }}>{meta.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#f8fafc", marginBottom: 2 }}>{meta.label}</div>
                      <div style={{
                        fontSize: 12, color: "rgba(248,250,252,0.4)",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {lastMsg?.content?.slice(0, 50) ?? "..."}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(248,250,252,0.25)", flexShrink: 0 }}>
                      {new Date(conv.updatedAt).toLocaleDateString("ar-SA")}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Unlock all agents */}
      {activeAgents.length < ALL_AGENT_TYPES.length && (
        <div style={{
          marginTop: 24, borderRadius: 20, padding: "28px 28px",
          background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#f8fafc" }}>
                أطلق قدرة فريقك الكاملة 🚀
              </h3>
              <p style={{ margin: 0, color: "rgba(248,250,252,0.5)", fontSize: 14 }}>
                {ALL_AGENT_TYPES.length - activeAgents.length} موظف AI لم تفعّلهم بعد
              </p>
            </div>
            <Link href="/billing" style={{
              padding: "11px 24px", borderRadius: 10,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#0a0f1e", fontWeight: 700, textDecoration: "none", fontSize: 15,
            }}>ترقية الباقة</Link>
          </div>
        </div>
      )}
    </div>
  );
}
