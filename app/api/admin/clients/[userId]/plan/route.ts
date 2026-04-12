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
  const { plan, maxAgents } = await req.json();

  const validPlans = ["trial", "starter", "team", "growth", "business"];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "باقة غير صحيحة" }, { status: 400 });
  }

  const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.subscription.updateMany({
    where: { userId },
    data: {
      plan,
      maxAgents: maxAgents ?? 1,
      status: plan === "trial" ? "trial" : "active",
      renewsAt,
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
