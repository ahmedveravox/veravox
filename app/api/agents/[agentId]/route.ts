import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { agentId } = await params;

  const agent = await db.businessAgent.findFirst({
    where: { id: agentId, business: { userId: session.user.id } },
    include: { business: { select: { name: true, type: true, dialect: true, tone: true } } },
  });

  if (!agent) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  return NextResponse.json(agent);
}
