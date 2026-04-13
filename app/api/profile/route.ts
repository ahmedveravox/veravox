import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      business: { include: { agents: true } },
      subscription: true,
    },
  });

  if (!user) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  return NextResponse.json({
    business: user.business,
    maxAgents: user.subscription?.maxAgents ?? 1,
    subscription: user.subscription,
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const body = await req.json();
  const { name, type, dialect, tone, products, paymentLinks, policies, whatsapp, telegramBotToken, telegramAgentType } = body;

  await db.business.updateMany({
    where: { userId: session.user.id },
    data: { name, type, dialect, tone, products, paymentLinks, policies, whatsapp, telegramBotToken, telegramAgentType },
  });

  return NextResponse.json({ success: true });
}
