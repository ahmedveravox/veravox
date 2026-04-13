import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await requireAdmin();
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "البريد الإلكتروني مطلوب" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  await db.user.update({ where: { email }, data: { isAdmin: true } });
  return NextResponse.json({ ok: true, message: "تم منح الصلاحية" });
}
