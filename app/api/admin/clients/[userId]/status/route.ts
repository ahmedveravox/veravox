import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

async function isAdmin(userId: string) {
  const u = await db.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  return u?.isAdmin ?? false;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const { userId } = await params;
  const { status } = await req.json();

  if (!["active", "suspended"].includes(status)) {
    return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
  }

  await db.user.update({ where: { id: userId }, data: { status } });
  return NextResponse.json({ success: true });
}
