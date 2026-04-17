import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import MessagesClient from "./messages-client";

export const metadata = { title: "رسائل العملاء – موظفي Admin" };

export default async function AdminMessagesPage() {
  await requireAdmin();

  const conversations = await db.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      agent: { select: { agentType: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: true } },
    },
  });

  const totalToday = conversations.filter(c => {
    const d = new Date(c.updatedAt), now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  }).length;

  const telegramCount = conversations.filter(c => c.title?.startsWith("telegram:")).length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: "0 0 6px" }}>💬 رسائل العملاء</h1>
        <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 14, margin: 0 }}>كل محادثات العملاء مع موظفي AI عبر جميع القنوات</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "إجمالي المحادثات", value: conversations.length, icon: "💬", color: "#3b82f6" },
          { label: "نشطة اليوم", value: totalToday, icon: "🔥", color: "#f59e0b" },
          { label: "عبر تيليجرام", value: telegramCount, icon: "✈️", color: "#0088cc" },
          { label: "عبر الويب", value: conversations.length - telegramCount, icon: "🌐", color: "#22c55e" },
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

      <MessagesClient conversations={conversations} />
    </div>
  );
}
