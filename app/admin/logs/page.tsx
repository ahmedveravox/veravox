import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export const metadata = { title: "سجل الإجراءات – Admin" };

const ACTION_ICONS: Record<string, string> = {
  extend_trial: "⏰", ticket_reply: "💬", broadcast: "📢",
  suspend: "🚫", activate: "✅", plan_change: "💳",
  grant_admin: "👑", clear_conversations: "🗑️",
};
const ACTION_LABELS: Record<string, string> = {
  extend_trial: "تمديد التجربة", ticket_reply: "رد تذكرة",
  broadcast: "إعلان", suspend: "إيقاف حساب",
  activate: "تفعيل حساب", plan_change: "تغيير الباقة",
  grant_admin: "منح صلاحية", clear_conversations: "مسح محادثات",
};

export default async function AdminLogsPage() {
  await requireAdmin();

  const logs = await db.adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const actionCounts = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.action] = (acc[l.action] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: "0 0 4px" }}>📋 سجل الإجراءات</h1>
        <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 13, margin: 0 }}>{logs.length} إجراء مسجّل</p>
      </div>

      {/* Action summary */}
      {Object.keys(actionCounts).length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          {Object.entries(actionCounts).map(([action, count]) => (
            <div key={action} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12,
              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)",
              color: "#f59e0b", display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>{ACTION_ICONS[action] ?? "⚡"}</span>
              <span>{ACTION_LABELS[action] ?? action}</span>
              <span style={{ fontWeight: 800 }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>جميع الإجراءات</h2>
        </div>

        {logs.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "rgba(248,250,252,0.25)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            لا توجد إجراءات مسجّلة بعد
          </div>
        ) : (
          <div>
            {logs.map((log, i) => (
              <div key={log.id} style={{
                padding: "14px 20px",
                borderBottom: i < logs.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                display: "flex", alignItems: "flex-start", gap: 14,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>
                  {ACTION_ICONS[log.action] ?? "⚡"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc" }}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                    {log.target && (
                      <span style={{ fontSize: 11, color: "rgba(248,250,252,0.3)", fontFamily: "monospace" }}>
                        {log.target.slice(0, 12)}...
                      </span>
                    )}
                  </div>
                  {log.details && (
                    <div style={{ fontSize: 12, color: "rgba(248,250,252,0.5)", lineHeight: 1.5 }}>{log.details}</div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,0.3)", flexShrink: 0, textAlign: "left" }}>
                  <div>{new Date(log.createdAt).toLocaleDateString("ar-SA")}</div>
                  <div>{new Date(log.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
