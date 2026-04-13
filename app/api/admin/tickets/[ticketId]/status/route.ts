import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  await requireAdmin();
  const { ticketId } = await params;
  const { status } = await req.json();

  const validStatuses = ["open", "in_progress", "resolved"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
  }

  await db.supportTicket.update({
    where: { id: ticketId },
    data: { status, updatedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
