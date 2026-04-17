"use client";
import { useState } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: string;
  createdAt: Date;
}

interface Props {
  announcements: Announcement[];
  totalUsers: number;
  trialUsers: number;
  activeUsers: number;
}

const AUDIENCE_LABELS: Record<string, string> = {
  all: "جميع العملاء",
  trial: "عملاء التجربة",
  active: "المشتركون النشطون",
};

const cardStyle: React.CSSProperties = {
  background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16, padding: "20px", marginBottom: 16,
};

export default function BroadcastClient({ announcements: initialAnnouncements, totalUsers, trialUsers, activeUsers }: Props) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("all");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const audienceCounts: Record<string, number> = {
    all: totalUsers,
    trial: trialUsers,
    active: activeUsers,
  };

  async function send() {
    if (!title.trim() || !content.trim()) {
      setMsg("يرجى ملء العنوان والمحتوى");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, audience }),
      });
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(prev => [data.announcement, ...prev]);
        setTitle(""); setContent(""); setAudience("all");
        setMsg("✓ تم إرسال الإعلان بنجاح");
      } else {
        setMsg(`خطأ: ${data.error}`);
      }
    } catch {
      setMsg("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Compose */}
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>✍️ إنشاء إعلان جديد</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="عنوان الإعلان..."
            style={{
              padding: "11px 14px", borderRadius: 10,
              background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#f8fafc", fontSize: 14, outline: "none", fontFamily: "inherit",
            }}
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="محتوى الإعلان..."
            rows={4}
            style={{
              padding: "11px 14px", borderRadius: 10,
              background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)",
              color: "#f8fafc", fontSize: 14, outline: "none", fontFamily: "inherit",
              resize: "vertical",
            }}
          />

          {/* Audience selector */}
          <div>
            <div style={{ fontSize: 12, color: "rgba(248,250,252,0.45)", marginBottom: 8 }}>الجمهور المستهدف:</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {(["all", "trial", "active"] as const).map(a => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  style={{
                    padding: "8px 16px", borderRadius: 20, fontSize: 13,
                    background: audience === a ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.03)",
                    border: audience === a ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.07)",
                    color: audience === a ? "#f59e0b" : "rgba(248,250,252,0.5)",
                    cursor: "pointer", fontFamily: "inherit", fontWeight: audience === a ? 700 : 400,
                  }}
                >
                  {AUDIENCE_LABELS[a]} ({audienceCounts[a]})
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {msg && (
              <div style={{
                fontSize: 13, padding: "8px 14px", borderRadius: 8,
                background: msg.startsWith("✓") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                color: msg.startsWith("✓") ? "#4ade80" : "#f87171",
                border: msg.startsWith("✓") ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
              }}>{msg}</div>
            )}
            <button
              onClick={send}
              disabled={loading}
              style={{
                marginRight: "auto",
                padding: "10px 24px", borderRadius: 10, border: "none",
                background: loading ? "rgba(245,158,11,0.2)" : "linear-gradient(135deg, #f59e0b, #d97706)",
                color: loading ? "rgba(245,158,11,0.5)" : "#0a0f1e",
                fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {loading ? "جاري الإرسال..." : "📤 إرسال الإعلان"}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div style={cardStyle}>
        <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>📜 تاريخ الإعلانات ({announcements.length})</h2>
        {announcements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "rgba(248,250,252,0.25)", fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📢</div>
            لا توجد إعلانات سابقة
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {announcements.map(a => (
              <div key={a.id} style={{
                padding: "14px 16px", borderRadius: 12,
                background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.1)",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#f8fafc" }}>{a.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{
                      padding: "2px 10px", borderRadius: 20, fontSize: 11,
                      background: "rgba(245,158,11,0.12)", color: "#f59e0b",
                      border: "1px solid rgba(245,158,11,0.2)",
                    }}>{AUDIENCE_LABELS[a.audience] ?? a.audience}</span>
                    <span style={{ fontSize: 11, color: "rgba(248,250,252,0.3)" }}>
                      {new Date(a.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "rgba(248,250,252,0.55)", lineHeight: 1.6 }}>{a.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
