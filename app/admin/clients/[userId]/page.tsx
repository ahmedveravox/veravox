import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminClientActions from "./client-actions";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;

  const client = await db.user.findUnique({
    where: { id: userId },
    include: {
      business: { include: { agents: true } },
      subscription: true,
      conversations: {
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: {
          agent: { select: { agentType: true } },
          _count: { select: { messages: true } },
        },
      },
      referrals: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!client) redirect("/admin/clients");

  const totalMessages = await db.message.count({
    where: { conversation: { userId: client.id } },
  });

  const AGENT_META: Record<string, { icon: string; label: string }> = {
    sales: { icon: "💼", label: "مبيعات" },
    support: { icon: "💬", label: "خدمة عملاء" },
    technical: { icon: "🔧", label: "دعم فني" },
    marketing: { icon: "🎨", label: "تسويق" },
    social: { icon: "📱", label: "سوشال" },
    analyst: { icon: "📊", label: "محلل" },
    manager: { icon: "🧠", label: "مدير" },
    orders: { icon: "📦", label: "طلبات" },
    reservations: { icon: "📅", label: "حجوزات" },
    invoices: { icon: "🧾", label: "فواتير" },
  };

  const planColors: Record<string, string> = {
    trial: "#f59e0b", starter: "#22c55e", team: "#3b82f6", growth: "#f59e0b", business: "#ef4444",
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Link href="/admin/clients" style={{ color: "rgba(248,250,252,0.4)", textDecoration: "none", fontSize: 13 }}>
          ← العملاء
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", margin: "0 0 4px" }}>
            {client.name}
          </h1>
          <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 13, margin: 0 }}>{client.email}</p>
        </div>
        <span style={{
          padding: "4px 14px", borderRadius: 20, fontSize: 12,
          background: client.status === "active" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          color: client.status === "active" ? "#4ade80" : "#f87171",
          border: client.status === "active" ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
        }}>
          {client.status === "active" ? "نشط" : "موقوف"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Business Info */}
        <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>🏪 النشاط التجاري</h2>
          {client.business ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["الاسم", client.business.name],
                ["النوع", client.business.type],
                ["اللهجة", client.business.dialect],
                ["النبرة", client.business.tone],
                ["واتساب", client.business.whatsapp ?? "—"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>{k}</span>
                  <span style={{ fontSize: 13, color: "#f8fafc", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          ) : <div style={{ color: "rgba(248,250,252,0.3)", fontSize: 13 }}>لا يوجد نشاط مُعرَّف</div>}
        </div>

        {/* Subscription */}
        <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>💳 الاشتراك</h2>
          {client.subscription ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>الباقة</span>
                <span style={{
                  padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: `${planColors[client.subscription.plan]}15`,
                  color: planColors[client.subscription.plan] ?? "#999",
                }}>{client.subscription.plan}</span>
              </div>
              {[
                ["الحالة", client.subscription.status],
                ["الموظفون المتاحون", String(client.subscription.maxAgents)],
                ["انتهاء التجربة", new Date(client.subscription.trialEnds).toLocaleDateString("ar-SA")],
                ["التجديد", new Date(client.subscription.renewsAt).toLocaleDateString("ar-SA")],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>{k}</span>
                  <span style={{ fontSize: 13, color: "#f8fafc" }}>{v}</span>
                </div>
              ))}
            </div>
          ) : <div style={{ color: "rgba(248,250,252,0.3)", fontSize: 13 }}>لا يوجد اشتراك</div>}
        </div>

        {/* Stats */}
        <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>📊 إحصائيات الاستخدام</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { l: "المحادثات", v: client.conversations.length, c: "#3b82f6" },
              { l: "الرسائل", v: totalMessages, c: "#22c55e" },
              { l: "الموظفون النشطون", v: client.business?.agents.filter(a => a.isActive).length ?? 0, c: "#f59e0b" },
              { l: "الإحالات", v: client.referrals.length, c: "#c084fc" },
            ].map(s => (
              <div key={s.l} style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px",
                border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "rgba(248,250,252,0.35)", marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Agents */}
        <div style={{ background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
          <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>🤖 الموظفون</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {client.business?.agents.map(agent => {
              const meta = AGENT_META[agent.agentType] ?? { icon: "🤖", label: agent.agentType };
              return (
                <div key={agent.id} style={{
                  padding: "5px 12px", borderRadius: 8, fontSize: 12,
                  background: agent.isActive ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
                  border: agent.isActive ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(255,255,255,0.06)",
                  color: agent.isActive ? "#4ade80" : "rgba(248,250,252,0.35)",
                }}>
                  {meta.icon} {meta.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent conversations */}
      <div style={{ marginTop: 18, background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "20px" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>💬 آخر المحادثات</h2>
        {client.conversations.length === 0 ? (
          <div style={{ color: "rgba(248,250,252,0.3)", fontSize: 13 }}>لا توجد محادثات بعد</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {client.conversations.map(conv => {
              const meta = AGENT_META[conv.agent.agentType] ?? { icon: "🤖", label: conv.agent.agentType };
              return (
                <div key={conv.id} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <span style={{ fontSize: 18 }}>{meta.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#f8fafc", fontWeight: 500 }}>
                      {conv.title ?? meta.label}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(248,250,252,0.3)" }}>
                      {new Date(conv.updatedAt).toLocaleDateString("ar-SA")}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>
                    {conv._count.messages} رسالة
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin Actions */}
      <AdminClientActions clientId={client.id} currentStatus={client.status} currentPlan={client.subscription?.plan ?? "trial"} />
    </div>
  );
}
