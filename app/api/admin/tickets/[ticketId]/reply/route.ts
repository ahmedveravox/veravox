import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const session = await auth();
  await requireAdmin();

  const { ticketId } = await params;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "الرد لا يمكن أن يكون فارغاً" }, { status: 400 });
  }

  const ticket = await db.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) return NextResponse.json({ error: "التذكرة غير موجودة" }, { status: 404 });

  const reply = await db.ticketReply.create({
    data: {
      ticketId,
      adminId: session?.user?.id ?? "admin",
      content: content.trim(),
    },
  });

  // Auto-set ticket to in_progress if still open
  if (ticket.status === "open") {
    await db.supportTicket.update({
      where: { id: ticketId },
      data: { status: "in_progress" },
    });
  }

  await db.adminLog.create({
    data: {
      adminId: session?.user?.id ?? "admin",
      action: "ticket_reply",
      target: ticketId,
      details: `Replied to ticket: ${ticket.subject}`,
    },
  });

  return NextResponse.json({ ok: true, reply });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  await requireAdmin();
  const { ticketId } = await params;

  const replies = await db.ticketReply.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(replies);
}
