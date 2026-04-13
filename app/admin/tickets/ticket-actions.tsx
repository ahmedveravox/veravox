"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  ticketId: string;
  currentStatus: string;
}

export default function TicketActions({ ticketId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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

  const actions = [
    { status: "open", label: "مفتوحة", color: "#f87171", bg: "rgba(239,68,68,0.1)" },
    { status: "in_progress", label: "معالجة", color: "#fcd34d", bg: "rgba(245,158,11,0.1)" },
    { status: "resolved", label: "محلولة", color: "#4ade80", bg: "rgba(34,197,94,0.1)" },
  ];

  return (
    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
      {actions.map(a => (
        <button
          key={a.status}
          onClick={() => updateStatus(a.status)}
          disabled={currentStatus === a.status || loading}
          style={{
            padding: "6px 12px", borderRadius: 8, border: "none",
            background: currentStatus === a.status ? a.bg : "rgba(255,255,255,0.04)",
            color: currentStatus === a.status ? a.color : "rgba(248,250,252,0.35)",
            fontSize: 11, fontWeight: currentStatus === a.status ? 600 : 400,
            cursor: currentStatus === a.status ? "default" : "pointer",
            fontFamily: "inherit", transition: "all 0.15s ease",
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
