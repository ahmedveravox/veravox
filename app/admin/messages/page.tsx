import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "رسائل العملاء – موظفي Admin" };

export default async function AdminMessagesPage() {
  await requireAdmin();

  const conversations = await db.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      agent: { select: { agentType: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
  });

  const AGENT_ICONS: Record<string, string> = {
    sales: "💼", support: "💬", technical: "🔧", marketing: "🎨",
    social: "📱", analyst: "📊", manager: "🧠", orders: "📦",
    reservations: "📅", invoices: "🧾",
  };

  const AGENT_LABELS: Record<string, string> = {
    sales: "مبيعات", support: "خدمة عملاء", technical: "دعم فني",
    marketing: "تسويق", social: "سوشال", analyst: "محلل",
    manager: "مدير AI", orders: "طلبات", reservations: "حجوزات", invoices: "فواتير",
  };

  const isTelegram = (title: string | null) => title?.startsWith("telegram:");
  const totalToday = conversations.filter(c => {
    const d = new Date(c.updatedAt);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  }).length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: "0 0 6px" }}>
          💬 رسائل العملاء
        </h1>
        <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 14, margin: 0 }}>
          كل محادثات العملاء مع موظفي AI عبر جميع القنوات
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "إجمالي المحادثات", value: conversations.length, icon: "💬", color: "#3b82f6" },
          { label: "نشطة اليوم", value: totalToday, icon: "🔥", color: "#f59e0b" },
          { label: "عبر تيليجرام", value: conversations.filter(c => isTelegram(c.title)).length, icon: "✈️", color: "#0088cc" },
          { label: "عبر الويب", value: conversations.filter(c => !isTelegram(c.title)).length, icon: "🌐", color: "#22c55e" },
        ].map(s => (
          <div key={s.label} style={{
            background: "rgba(20,30,50,0.8)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <span style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Conversations table */}
      <div style={{ background: "rgba(20,30,50,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr 1fr 1fr", gap: 12 }}>
          {["العميل", "القناة", "الموظف", "آخر رسالة", "الرسائل", "آخر نشاط"].map(h => (
            <div key={h} style={{ fontSize: 12, fontWeight: 600, color: "rgba(248,250,252,0.35)", textAlign: "right" }}>{h}</div>
          ))}
        </div>
        {conversations.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(248,250,252,0.3)", fontSize: 14 }}>
            لا توجد محادثات بعد
          </div>
        ) : (
          conversations.map(conv => {
            const lastMsg = conv.messages[0];
            const telegram = isTelegram(conv.title);
            const agentType = conv.agent.agentType;
            const updatedAt = new Date(conv.updatedAt);
            const now = new Date();
            const diffMs = now.getTime() - updatedAt.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const timeStr = diffMins < 60 ? `منذ ${diffMins}د` : diffMins < 1440 ? `منذ ${Math.floor(diffMins/60)}س` : updatedAt.toLocaleDateString("ar-SA");

            return (
              <div key={conv.id} style={{
                padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)",
                display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr 1fr 1fr", gap: 12, alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc" }}>{conv.user.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(248,250,252,0.3)" }}>{conv.user.email}</div>
                </div>
                <div>
                  <span style={{
                    padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: telegram ? "rgba(0,136,204,0.15)" : "rgba(34,197,94,0.1)",
                    color: telegram ? "#38bdf8" : "#4ade80",
                    border: `1px solid ${telegram ? "rgba(0,136,204,0.2)" : "rgba(34,197,94,0.2)"}`,
                  }}>
                    {telegram ? "✈️ تيليجرام" : "🌐 ويب"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 16 }}>{AGENT_ICONS[agentType] ?? "🤖"}</span>
                  <span style={{ fontSize: 12, color: "rgba(248,250,252,0.6)" }}>{AGENT_LABELS[agentType] ?? agentType}</span>
                </div>
                <div style={{ fontSize: 13, color: "rgba(248,250,252,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {lastMsg ? (
                    <span>
                      <span style={{ color: lastMsg.role === "user" ? "#fcd34d" : "rgba(248,250,252,0.4)", fontSize: 11, marginLeft: 4 }}>
                        {lastMsg.role === "user" ? "👤" : "🤖"}
                      </span>
                      {lastMsg.content.slice(0, 60)}{lastMsg.content.length > 60 ? "..." : ""}
                    </span>
                  ) : "—"}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#60a5fa" }}>{conv._count.messages}</div>
                <div style={{ fontSize: 12, color: "rgba(248,250,252,0.35)" }}>{timeStr}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
