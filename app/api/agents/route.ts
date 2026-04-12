import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { agentType, active } = await req.json();

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "لا يوجد نشاط تجاري" }, { status: 404 });

  const existing = await db.businessAgent.findUnique({
    where: { businessId_agentType: { businessId: business.id, agentType } },
  });

  if (existing) {
    await db.businessAgent.update({
      where: { id: existing.id },
      data: { isActive: active },
    });
  } else {
    await db.businessAgent.create({
      data: { businessId: business.id, agentType, isActive: active },
    });
  }

  return NextResponse.json({ success: true });
}
