"use client";
import { useState } from "react";

interface Props {
  adminId: string;
}

export default function AdminSettingsClient({ adminId }: Props) {
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminMsg, setAdminMsg] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const [exportLoading, setExportLoading] = useState(false);

  async function grantAdmin() {
    if (!newAdminEmail.trim()) return;
    setAdminLoading(true);
    setAdminMsg("");
    const res = await fetch("/api/admin/grant-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newAdminEmail }),
    });
    const data = await res.json();
    setAdminMsg(res.ok ? `✓ تم منح صلاحيات المدير لـ ${newAdminEmail}` : `خطأ: ${data.error}`);
    if (res.ok) setNewAdminEmail("");
    setAdminLoading(false);
  }

  async function exportData() {
    setExportLoading(true);
    const res = await fetch("/api/admin/export");
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tayf-clients-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExportLoading(false);
  }

  const sectionStyle: React.CSSProperties = {
    background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 16, padding: "20px", marginBottom: 16,
  };
  const inputStyle: React.CSSProperties = {
    flex: 1, padding: "10px 14px", borderRadius: 9,
    background: "rgba(15,23,42,0.8)", border: "1px solid rgba(255,255,255,0.08)",
    color: "#f8fafc", fontSize: 14, outline: "none", fontFamily: "inherit",
    direction: "ltr",
  };
  const btnStyle: React.CSSProperties = {
    padding: "10px 20px", borderRadius: 9, border: "none",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    color: "#0a0f1e", fontWeight: 700, fontSize: 13,
    cursor: "pointer", fontFamily: "inherit",
  };

  return (
    <>
      {/* Grant admin */}
      <div style={sectionStyle}>
        <h2 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
          👑 منح صلاحيات المدير
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "rgba(248,250,252,0.4)" }}>
          أدخل بريد المستخدم لمنحه صلاحيات المدير الكاملة
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="email"
            value={newAdminEmail}
            onChange={e => setNewAdminEmail(e.target.value)}
            placeholder="admin@example.com"
            style={inputStyle}
            onKeyDown={e => e.key === "Enter" && grantAdmin()}
          />
          <button onClick={grantAdmin} disabled={adminLoading} style={btnStyle}>
            {adminLoading ? "..." : "منح الصلاحية"}
          </button>
        </div>
        {adminMsg && (
          <div style={{
            marginTop: 10, padding: "8px 14px", borderRadius: 8, fontSize: 13,
            background: adminMsg.startsWith("✓") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: adminMsg.startsWith("✓") ? "#4ade80" : "#f87171",
            border: adminMsg.startsWith("✓") ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
          }}>{adminMsg}</div>
        )}
      </div>

      {/* Export data */}
      <div style={sectionStyle}>
        <h2 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
          📊 تصدير البيانات
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "rgba(248,250,252,0.4)" }}>
          تصدير بيانات العملاء بصيغة CSV
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={exportData} disabled={exportLoading} style={btnStyle}>
            {exportLoading ? "جاري التصدير..." : "📥 تصدير العملاء CSV"}
          </button>
        </div>
      </div>

      {/* Platform info */}
      <div style={sectionStyle}>
        <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
          ℹ️ معلومات المنصة
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "اسم المنصة", value: "طيف · Tayf AI Workforce OS" },
            { label: "الإصدار", value: "1.0.0" },
            { label: "قاعدة البيانات", value: "SQLite (dev) / PostgreSQL (prod)" },
            { label: "AI", value: "Anthropic Claude (claude-sonnet-4-6)" },
            { label: "المنصة", value: "Next.js 16 + TypeScript" },
            { label: "معرّف المدير", value: adminId },
          ].map(info => (
            <div key={info.label} style={{
              display: "flex", gap: 12, alignItems: "center",
              padding: "10px 14px", borderRadius: 10,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontSize: 12, color: "rgba(248,250,252,0.4)", width: 140, flexShrink: 0 }}>{info.label}</span>
              <span style={{ fontSize: 13, color: "#f8fafc", fontFamily: info.label === "معرّف المدير" ? "monospace" : "inherit" }}>{info.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{
        ...sectionStyle,
        border: "1px solid rgba(239,68,68,0.2)",
        background: "rgba(239,68,68,0.03)",
      }}>
        <h2 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#f87171" }}>
          ⚠️ منطقة الخطر
        </h2>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "rgba(248,250,252,0.4)" }}>
          هذه الإجراءات لا يمكن التراجع عنها
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => confirm("هل أنت متأكد من حذف جميع المحادثات؟") && fetch("/api/admin/clear-conversations", { method: "DELETE" })}
            style={{
              padding: "10px 20px", borderRadius: 9,
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            🗑️ مسح جميع المحادثات
          </button>
        </div>
      </div>
    </>
  );
}
