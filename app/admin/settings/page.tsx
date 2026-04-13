import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import AdminSettingsClient from "./settings-client";

export const metadata = { title: "الإعدادات – Admin" };

export default async function AdminSettingsPage() {
  const session = await requireAdmin();

  const [totalUsers, totalSubs, dbStats] = await Promise.all([
    db.user.count(),
    db.subscription.count(),
    Promise.resolve({
      conversations: db.conversation.count(),
      messages: db.message.count(),
    }),
  ]);

  const [conversations, messages] = await Promise.all([
    dbStats.conversations,
    dbStats.messages,
  ]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: "0 0 4px" }}>
          ⚙️ إعدادات المنصة
        </h1>
        <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 13, margin: 0 }}>
          إدارة المنصة والمستخدمين والبيانات
        </p>
      </div>

      {/* DB stats */}
      <div style={{
        background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16, padding: "20px", marginBottom: 20,
      }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>
          📊 إحصائيات قاعدة البيانات
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "المستخدمون", value: totalUsers },
            { label: "الاشتراكات", value: totalSubs },
            { label: "المحادثات", value: conversations },
            { label: "الرسائل", value: messages },
          ].map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 12, padding: "14px", textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(248,250,252,0.35)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <AdminSettingsClient adminId={session.user!.id!} />
    </div>
  );
}
