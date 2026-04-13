import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import TicketActions from "./ticket-actions";

export const metadata = { title: "تذاكر الدعم – Admin" };

const PRIORITY_COLORS: Record<string, [string, string]> = {
  high:   ["rgba(239,68,68,0.12)",   "#f87171"],
  normal: ["rgba(245,158,11,0.12)",  "#fcd34d"],
  low:    ["rgba(100,116,139,0.12)", "#94a3b8"],
};
const STATUS_COLORS: Record<string, [string, string]> = {
  open:        ["rgba(239,68,68,0.12)",  "#f87171"],
  in_progress: ["rgba(245,158,11,0.12)", "#fcd34d"],
  resolved:    ["rgba(34,197,94,0.12)",  "#4ade80"],
};

export default async function TicketsPage() {
  await requireAdmin();

  const tickets = await db.supportTicket.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  // Fetch users for these tickets
  const userIds = [...new Set(tickets.map(t => t.userId))];
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  const openCount = tickets.filter(t => t.status === "open").length;
  const inProgressCount = tickets.filter(t => t.status === "in_progress").length;
  const resolvedCount = tickets.filter(t => t.status === "resolved").length;
  const highCount = tickets.filter(t => t.priority === "high").length;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc", margin: "0 0 4px" }}>
          🎫 تذاكر الدعم
        </h1>
        <p style={{ color: "rgba(248,250,252,0.4)", fontSize: 13, margin: 0 }}>
          {tickets.length} تذكرة إجمالاً
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "مفتوحة", value: openCount, color: "#f87171" },
          { label: "قيد المعالجة", value: inProgressCount, color: "#fcd34d" },
          { label: "محلولة", value: resolvedCount, color: "#4ade80" },
          { label: "أولوية عالية", value: highCount, color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 14, padding: "16px",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tickets list */}
      <div style={{
        background: "rgba(20,30,50,0.9)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 18, overflow: "hidden",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>جميع التذاكر</h2>
        </div>

        {tickets.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "rgba(248,250,252,0.25)", fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>
            لا توجد تذاكر دعم بعد
          </div>
        ) : (
          <div>
            {tickets.map(ticket => {
              const user = userMap[ticket.userId];
              const [priorityBg, priorityColor] = PRIORITY_COLORS[ticket.priority] ?? PRIORITY_COLORS.normal;
              const [statusBg, statusColor] = STATUS_COLORS[ticket.status] ?? STATUS_COLORS.open;
              return (
                <div key={ticket.id} style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                    {/* Priority indicator */}
                    <div style={{
                      width: 4, alignSelf: "stretch", borderRadius: 4,
                      background: priorityColor, flexShrink: 0,
                    }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#f8fafc" }}>{ticket.subject}</span>
                        <span style={{
                          padding: "2px 9px", borderRadius: 20, fontSize: 11,
                          background: statusBg, color: statusColor,
                          border: `1px solid ${statusColor}30`,
                        }}>
                          {ticket.status === "open" ? "مفتوحة" : ticket.status === "in_progress" ? "قيد المعالجة" : "محلولة"}
                        </span>
                        <span style={{
                          padding: "2px 9px", borderRadius: 20, fontSize: 11,
                          background: priorityBg, color: priorityColor,
                          border: `1px solid ${priorityColor}30`,
                        }}>
                          {ticket.priority === "high" ? "عالية" : ticket.priority === "low" ? "منخفضة" : "عادية"}
                        </span>
                      </div>

                      <p style={{
                        margin: "0 0 10px", fontSize: 13, color: "rgba(248,250,252,0.55)",
                        lineHeight: 1.5, display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>{ticket.message}</p>

                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ fontSize: 12, color: "rgba(248,250,252,0.4)" }}>
                          {user ? `${user.name} · ${user.email}` : `userId: ${ticket.userId}`}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(248,250,252,0.3)" }}>
                          {new Date(ticket.createdAt).toLocaleDateString("ar-SA")}
                        </div>
                      </div>
                    </div>

                    <TicketActions ticketId={ticket.id} currentStatus={ticket.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
