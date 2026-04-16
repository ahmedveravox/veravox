import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildSystemPrompt } from "@/lib/ai/orchestrator";

// Telegram API helper
async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  });
}

async function sendTyping(botToken: string, chatId: number) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ botToken: string }> }
) {
  const { botToken } = await params;

  // Find business by Telegram bot token
  const business = await db.business.findFirst({
    where: { telegramBotToken: botToken },
    include: {
      user: { include: { subscription: true } },
      agents: { where: { isActive: true } },
    },
  });

  if (!business) {
    return NextResponse.json({ ok: false, error: "bot not found" }, { status: 404 });
  }

  // Check subscription
  const sub = business.user.subscription;
  if (business.user.status === "suspended") {
    return NextResponse.json({ ok: false });
  }

  const update = await req.json();

  // Handle only text messages
  const msg = update?.message ?? update?.edited_message;
  if (!msg?.text) return NextResponse.json({ ok: true });

  const chatId: number = msg.chat.id;
  const userText: string = msg.text;
  const telegramUserId = String(msg.from?.id ?? chatId);
  const userName = msg.from?.first_name ?? "عميل";

  // Trial check
  if (sub?.status === "trial") {
    const expired = new Date(sub.trialEnds) < new Date();
    if (expired) {
      await sendTelegramMessage(botToken, chatId,
        `⏰ عذراً ${userName}، خدمة ${business.name} متوقفة مؤقتاً. يرجى التواصل مع صاحب النشاط.`);
      return NextResponse.json({ ok: true });
    }
  }

  // Find the right agent
  const agentType = business.telegramAgentType ?? "support";
  const agent = business.agents.find(a => a.agentType === agentType)
    ?? business.agents[0];

  if (!agent) {
    await sendTelegramMessage(botToken, chatId,
      `أهلاً ${userName}! سنرد عليك قريباً.`);
    return NextResponse.json({ ok: true });
  }

  // Show typing indicator
  await sendTyping(botToken, chatId);

  // Get or create conversation for this Telegram user
  let conv = await db.conversation.findFirst({
    where: {
      userId: business.userId,
      agentId: agent.id,
      title: `telegram:${telegramUserId}`,
    },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
  });

  if (!conv) {
    conv = await db.conversation.create({
      data: {
        userId: business.userId,
        agentId: agent.id,
        title: `telegram:${telegramUserId}`,
        messages: { create: { role: "user", content: userText } },
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  } else {
    await db.message.create({
      data: { conversationId: conv.id, role: "user", content: userText },
    });
    conv = await db.conversation.findFirst({
      where: { id: conv.id },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
    }) as typeof conv;
  }

  const systemPrompt = buildSystemPrompt(agent.agentType, business as Parameters<typeof buildSystemPrompt>[1]);
  let reply = "";

  const apiKey = process.env.ANTHROPIC_API_KEY;

  const isEn = business.dialect === "en";
  if (!apiKey) {
    // Mock response when no API key
    const mocks: Record<string, string> = isEn ? {
      sales: `Hello ${userName}! 💼 I'm the Sales Agent at ${business.name}. How can I help you today?`,
      support: `Hi ${userName}! 😊 I'm Customer Support at ${business.name}. How can I assist you?`,
      technical: `Hello ${userName}! 🔧 Technical Support at ${business.name} here. What's the issue?`,
      orders: `Hi ${userName}! 📦 I can track your order at ${business.name}. What's your order number?`,
      reservations: `Hello ${userName}! 📅 You can book with ${business.name} right now. What time works for you?`,
    } : {
      sales: `أهلاً ${userName}! 💼 أنا موظف المبيعات في ${business.name}. كيف أستطيع مساعدتك اليوم؟`,
      support: `مرحباً ${userName}! 😊 أنا خدمة عملاء ${business.name}. كيف أخدمك؟`,
      technical: `أهلاً ${userName}! 🔧 الدعم الفني في ${business.name} معك. ما هي مشكلتك؟`,
      orders: `مرحباً ${userName}! 📦 يمكنني متابعة طلبك في ${business.name}. ما رقم طلبك؟`,
      reservations: `أهلاً ${userName}! 📅 يمكنك الحجز في ${business.name} الآن. ما الوقت المناسب لك؟`,
    };
    reply = mocks[agent.agentType] ?? (isEn
      ? `Hello ${userName}! How can I help you at ${business.name}?`
      : `أهلاً ${userName}! كيف أخدمك في ${business.name}؟`);
  } else {
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const client = new Anthropic({ apiKey });

      const history = (conv?.messages ?? [])
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-16)
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        system: systemPrompt,
        messages: history,
      });

      reply = response.content[0].type === "text" ? response.content[0].text : "";
    } catch {
      reply = `أهلاً ${userName}! نحن من ${business.name}. سنرد عليك قريباً.`;
    }
  }

  // Save assistant response
  await db.message.create({
    data: { conversationId: conv!.id, role: "assistant", content: reply },
  });
  await db.conversation.update({
    where: { id: conv!.id }, data: { updatedAt: new Date() },
  });

  // Send reply to Telegram
  await sendTelegramMessage(botToken, chatId, reply);

  return NextResponse.json({ ok: true });
}

// GET: verify webhook setup
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ botToken: string }> }
) {
  const { botToken } = await params;
  const business = await db.business.findFirst({
    where: { telegramBotToken: botToken },
    select: { name: true },
  });
  if (!business) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, business: business.name, status: "webhook active" });
}
