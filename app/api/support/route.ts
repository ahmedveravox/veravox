import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });

  const { subject, message, priority } = await req.json();
  if (!subject || !message) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });

  const ticket = await db.supportTicket.create({
    data: {
      userId: session.user.id,
      subject,
      message,
      priority: priority ?? "normal",
      status: "open",
    },
  });

  return NextResponse.json({ ok: true, ticketId: ticket.id });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "غير مسجل" }, { status: 401 });

  const tickets = await db.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}
