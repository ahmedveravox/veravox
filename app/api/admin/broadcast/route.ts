import { requireAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  await requireAdmin();

  const { title, content, audience } = await req.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "العنوان والمحتوى مطلوبان" }, { status: 400 });
  }

  const announcement = await db.announcement.create({
    data: {
      adminId: session?.user?.id ?? "admin",
      title: title.trim(),
      content: content.trim(),
      audience: audience ?? "all",
    },
  });

  await db.adminLog.create({
    data: {
      adminId: session?.user?.id ?? "admin",
      action: "broadcast",
      target: announcement.id,
      details: `Sent announcement "${title}" to audience: ${audience ?? "all"}`,
    },
  });

  return NextResponse.json({ ok: true, announcement });
}

export async function GET() {
  await requireAdmin();
  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(announcements);
}
