import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// POST: register webhook URL with Telegram
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { botToken } = await req.json();
  if (!botToken?.trim()) return NextResponse.json({ error: "توكن البوت مطلوب" }, { status: 400 });

  // Verify the business belongs to this user
  const business = await db.business.findFirst({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "النشاط غير موجود" }, { status: 404 });

  // Determine the webhook URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const webhookUrl = `${siteUrl}/api/telegram/${botToken.trim()}`;

  try {
    // First verify the token by calling getMe
    const meRes = await fetch(`https://api.telegram.org/bot${botToken.trim()}/getMe`);
    const meData = await meRes.json();
    if (!meData.ok) {
      return NextResponse.json({ error: "توكن البوت غير صحيح – تأكد من النسخ من @BotFather" }, { status: 400 });
    }

    // Register webhook with Telegram
    const whRes = await fetch(`https://api.telegram.org/bot${botToken.trim()}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl, allowed_updates: ["message", "edited_message"] }),
    });
    const whData = await whRes.json();
    if (!whData.ok) {
      return NextResponse.json({ error: `فشل تسجيل الـ webhook: ${whData.description}` }, { status: 400 });
    }

    // Save token to DB
    await db.business.update({
      where: { id: business.id },
      data: { telegramBotToken: botToken.trim() },
    });

    return NextResponse.json({
      ok: true,
      botName: meData.result.first_name,
      botUsername: meData.result.username,
      webhookUrl,
    });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بـ Telegram. تحقق من التوكن والإنترنت." }, { status: 500 });
  }
}

// DELETE: remove webhook
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const business = await db.business.findFirst({ where: { userId: session.user.id } });
  if (!business?.telegramBotToken) return NextResponse.json({ ok: true });

  try {
    await fetch(`https://api.telegram.org/bot${business.telegramBotToken}/deleteWebhook`, { method: "POST" });
  } catch { /* ignore */ }

  await db.business.update({
    where: { id: business.id },
    data: { telegramBotToken: null },
  });

  return NextResponse.json({ ok: true });
}
