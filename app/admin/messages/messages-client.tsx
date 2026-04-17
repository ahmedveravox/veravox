"use client";
import { useState, useTransition } from "react";

interface Conv {
  id: string;
  title: string | null;
  updatedAt: Date;
  user: { name: string; email: string };
  agent: { agentType: string };
  messages: Array<{ role: string; content: string }>;
  _count: { messages: number };
}

interface SearchResult {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  conversation: {
    id: string;
    title: string | null;
    userId: string;
    agent: { agentType: string };
    user: { name: string; email: string };
  };
}

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

export default function MessagesClient({ conversations }: { conversations: Conv[] }) {
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [, startTransition] = useTransition();

  async function doSearch() {
    if (!searchQ.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/messages/search?q=${encodeURIComponent(searchQ)}`);
      const data = await res.json();
      setSearchResults(data.results ?? []);
    } finally {
      setSearching(false);
    }
  }

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text.slice(0, 80);
    const start = Math.max(0, idx - 30);
    const end = Math.min(text.length, idx + q.length + 50);
    return (start > 0 ? "..." : "") + text.slice(start, end) + (end < text.length ? "..." : "");
  };

  return (
    <>
      {/* Search Bar */}
      <div style={{
        background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 14, padding: "14px 18px", marginBottom: 18,
        display: "flex", gap: 10, alignItems: "center",
      }}>
        <span style={{ fontSize: 16 }}>🔍</span>
        <input
          type="text"
          value={searchQ}
          onChange={e => { setSearchQ(e.target.value); if (!e.target.value.trim()) setSearchResults(null); }}
          onKeyDown={e => e.key === "Enter" && doSearch()}
          placeholder="ابحث في محتوى الرسائل..."
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: "#f8fafc", fontSize: 14, fontFamily: "inherit",
          }}
        />
        <button onClick={doSearch} disabled={searching} style={{
          padding: "8px 18px", borderRadius: 9, border: "none",
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "#0a0f1e", fontWeight: 700, fontSize: 13,
          cursor: searching ? "wait" : "pointer", fontFamily: "inherit",
        }}>
          {searching ? "..." : "بحث"}
        </button>
        {searchResults !== null && (
          <button onClick={() => { setSearchResults(null); setSearchQ(""); }} style={{
            padding: "8px 14px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.08)",
            background: "transparent", color: "rgba(248,250,252,0.4)",
            fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}>✕ مسح</button>
        )}
      </div>

      {/* Search Results */}
      {searchResults !== null && (
        <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 16, marginBottom: 18, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>نتائج البحث عن: "{searchQ}"</span>
            <span style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>({searchResults.length} رسالة)</span>
          </div>
          {searchResults.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "rgba(248,250,252,0.3)", fontSize: 13 }}>لا توجد نتائج</div>
          ) : (
            searchResults.map(r => (
              <div key={r.id} style={{
                padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)",
                display: "flex", alignItems: "flex-start", gap: 12,
              }}>
                <span style={{ fontSize: 16 }}>{r.role === "user" ? "👤" : "🤖"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#f8fafc" }}>{r.conversation.user.name}</span>
                    <span style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>{AGENT_ICONS[r.conversation.agent.agentType] ?? "🤖"} {AGENT_LABELS[r.conversation.agent.agentType] ?? r.conversation.agent.agentType}</span>
                    <span style={{ fontSize: 11, color: "rgba(248,250,252,0.25)" }}>{new Date(r.createdAt).toLocaleDateString("ar-SA")}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(248,250,252,0.65)", lineHeight: 1.5 }}
                    dangerouslySetInnerHTML={{ __html: highlight(r.content, searchQ).replace(new RegExp(searchQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), match => `<mark style="background:rgba(245,158,11,0.3);color:#f59e0b;border-radius:3px;padding:0 2px">${match}</mark>`) }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Conversations Table */}
      <div style={{ background: "rgba(20,30,50,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr 1fr 1fr", gap: 12 }}>
          {["العميل", "القناة", "الموظف", "آخر رسالة", "الرسائل", "آخر نشاط"].map(h => (
            <div key={h} style={{ fontSize: 12, fontWeight: 600, color: "rgba(248,250,252,0.35)", textAlign: "right" }}>{h}</div>
          ))}
        </div>
        {conversations.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "rgba(248,250,252,0.3)", fontSize: 14 }}>لا توجد محادثات بعد</div>
        ) : (
          conversations.map(conv => {
            const lastMsg = conv.messages[0];
            const telegram = conv.title?.startsWith("telegram:");
            const agentType = conv.agent.agentType;
            const now = new Date();
            const diffMs = now.getTime() - new Date(conv.updatedAt).getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const timeStr = diffMins < 60 ? `منذ ${diffMins}د` : diffMins < 1440 ? `منذ ${Math.floor(diffMins / 60)}س` : new Date(conv.updatedAt).toLocaleDateString("ar-SA");

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
                  }}>{telegram ? "✈️ تيليجرام" : "🌐 ويب"}</span>
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
    </>
  );
}
