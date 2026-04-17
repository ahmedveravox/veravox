import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get("take") ?? 100), 200);
  const skip = Number(searchParams.get("skip") ?? 0);

  const [logs, total] = await Promise.all([
    db.adminLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.adminLog.count(),
  ]);

  return NextResponse.json({ logs, total });
}
