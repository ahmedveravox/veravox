"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  ticketId: string;
  currentStatus: string;
  ticketSubject: string;
}

export default function TicketActions({ ticketId, currentStatus, ticketSubject }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyMsg, setReplyMsg] = useState("");

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch(`/api/admin/tickets/${ticketId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
  }

  async function sendReply() {
    if (!replyText.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyText }),
    });
    setLoading(false);
    if (res.ok) {
      setReplyMsg("✓ تم إرسال الرد");
      setReplyText("");
      setShowReply(false);
      setTimeout(() => setReplyMsg(""), 3000);
      router.refresh();
    } else {
      const d = await res.json();
      setReplyMsg(`خطأ: ${d.error}`);
    }
  }

  const statusActions = [
    { status: "open", label: "مفتوحة", color: "#f87171", bg: "rgba(239,68,68,0.1)" },
    { status: "in_progress", label: "معالجة", color: "#fcd34d", bg: "rgba(245,158,11,0.1)" },
    { status: "resolved", label: "محلولة", color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0, alignItems: "flex-end" }}>
      <div style={{ display: "flex", gap: 6 }}>
        {statusActions.map(a => (
          <button
            key={a.status}
            onClick={() => updateStatus(a.status)}
            disabled={currentStatus === a.status || loading}
            style={{
              padding: "6px 10px", borderRadius: 8, border: "none",
              background: currentStatus === a.status ? a.bg : "rgba(255,255,255,0.04)",
              color: currentStatus === a.status ? a.color : "rgba(248,250,252,0.35)",
              fontSize: 11, fontWeight: currentStatus === a.status ? 600 : 400,
              cursor: currentStatus === a.status ? "default" : "pointer",
              fontFamily: "inherit",
            }}>{a.label}</button>
        ))}
        <button
          onClick={() => setShowReply(!showReply)}
          style={{
            padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.25)",
            background: showReply ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.06)",
            color: "#f59e0b", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>💬 رد</button>
      </div>

      {showReply && (
        <div style={{ width: 300 }}>
          <textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder={`رد على: ${ticketSubject}`}
            rows={3}
            style={{
              width: "100%", padding: "9px 12px", borderRadius: 9,
              background: "rgba(15,23,42,0.9)", border: "1px solid rgba(245,158,11,0.2)",
              color: "#f8fafc", fontSize: 13, outline: "none", fontFamily: "inherit",
              resize: "none", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button onClick={() => setShowReply(false)} style={{
              flex: 1, padding: "7px", borderRadius: 7, border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent", color: "rgba(248,250,252,0.4)", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}>إلغاء</button>
            <button onClick={sendReply} disabled={loading || !replyText.trim()} style={{
              flex: 1, padding: "7px", borderRadius: 7, border: "none",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#0a0f1e", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}>إرسال</button>
          </div>
          {replyMsg && <div style={{ marginTop: 6, fontSize: 12, color: replyMsg.startsWith("✓") ? "#4ade80" : "#f87171" }}>{replyMsg}</div>}
        </div>
      )}
    </div>
  );
}
