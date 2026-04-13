import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE() {
  await requireAdmin();

  await db.message.deleteMany({});
  await db.conversation.deleteMany({});

  return NextResponse.json({ ok: true, message: "تم مسح جميع المحادثات" });
}
