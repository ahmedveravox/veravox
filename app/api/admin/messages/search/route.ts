import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const take = Math.min(Number(searchParams.get("take") ?? 30), 100);

  if (!q) return NextResponse.json({ results: [] });

  const messages = await db.message.findMany({
    where: { content: { contains: q } },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      conversation: {
        select: {
          id: true,
          title: true,
          userId: true,
          agent: { select: { agentType: true } },
          user: { select: { name: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json({ results: messages });
}
