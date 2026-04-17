import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  await requireAdmin();
  const { userId } = await params;
  const { days } = await req.json();

  if (!days || typeof days !== "number" || days < 1 || days > 365) {
    return NextResponse.json({ error: "أدخل عدد أيام صحيح (1-365)" }, { status: 400 });
  }

  const sub = await db.subscription.findUnique({ where: { userId } });
  if (!sub) return NextResponse.json({ error: "لا يوجد اشتراك" }, { status: 404 });

  const base = new Date(sub.trialEnds) > new Date() ? new Date(sub.trialEnds) : new Date();
  base.setDate(base.getDate() + days);

  await db.subscription.update({
    where: { userId },
    data: { trialEnds: base, status: "trial" },
  });

  await db.adminLog.create({
    data: {
      adminId: "admin",
      action: "extend_trial",
      target: userId,
      details: `Extended trial by ${days} days → ${base.toISOString().split("T")[0]}`,
    },
  });

  return NextResponse.json({ ok: true, newTrialEnds: base });
}
