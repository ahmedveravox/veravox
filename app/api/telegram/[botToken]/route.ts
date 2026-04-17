import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildSystemPrompt } from "@/lib/ai/orchestrator";
import { streamGemini, historyToGemini } from "@/lib/ai/gemini";

async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
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

  const business = await db.business.findFirst({
    where: { telegramBotToken: botToken },
    include: {
      user: { include: { subscription: true } },
      agents: { where: { isActive: true } },
    },
  });

  if (!business) return NextResponse.json({ ok: false, error: "bot not found" }, { status: 404 });
  if (business.user.status === "suspended") return NextResponse.json({ ok: false });

  const update = await req.json();
  const msg = update?.message ?? update?.edited_message;
  if (!msg?.text) return NextResponse.json({ ok: true });

  const chatId: number = msg.chat.id;
  const userText: string = msg.text;
  const telegramUserId = String(msg.from?.id ?? chatId);
  const userName = msg.from?.first_name ?? "عميل";
  const isEn = business.dialect === "en";

  const sub = business.user.subscription;
  if (sub?.status === "trial" && new Date(sub.trialEnds) < new Date()) {
    await sendTelegramMessage(botToken, chatId,
      isEn
        ? `⏰ Sorry ${userName}, ${business.name} service is temporarily paused.`
        : `⏰ عذراً ${userName}، خدمة ${business.name} متوقفة مؤقتاً.`);
    return NextResponse.json({ ok: true });
  }

  const agentType = business.telegramAgentType ?? "support";
  const agent = business.agents.find(a => a.agentType === agentType) ?? business.agents[0];

  if (!agent) {
    await sendTelegramMessage(botToken, chatId,
      isEn ? `Hello ${userName}! We'll get back to you shortly.` : `أهلاً ${userName}! سنرد عليك قريباً.`);
    return NextResponse.json({ ok: true });
  }

  await sendTyping(botToken, chatId);

  let conv = await db.conversation.findFirst({
    where: { userId: business.userId, agentId: agent.id, title: `telegram:${telegramUserId}` },
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
    await db.message.create({ data: { conversationId: conv.id, role: "user", content: userText } });
    conv = await db.conversation.findFirst({
      where: { id: conv.id },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
    }) as typeof conv;
  }

  const systemPrompt = buildSystemPrompt(agent.agentType, business as Parameters<typeof buildSystemPrompt>[1]);
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  let reply = "";

  if (geminiKey) {
    try {
      const history = (conv?.messages ?? [])
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-16, -1);
      await streamGemini({
        apiKey: geminiKey,
        systemPrompt,
        history: historyToGemini(history),
        userText,
        onChunk: (t) => { reply += t; },
        onDone: () => {},
      });
    } catch {
      reply = isEn ? `Hello ${userName}! From ${business.name}.` : `أهلاً ${userName}! من ${business.name}.`;
    }
  } else if (anthropicKey) {
    try {
      const Anthropic = (await import("@anthropic-ai/sdk")).default;
      const client = new Anthropic({ apiKey: anthropicKey });
      const history = (conv?.messages ?? [])
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-16)
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));
      const response = await client.messages.create({
        model: "claude-sonnet-4-6", max_tokens: 512, system: systemPrompt, messages: history,
      });
      reply = response.content[0].type === "text" ? response.content[0].text : "";
    } catch {
      reply = isEn ? `Hello ${userName}!` : `أهلاً ${userName}!`;
    }
  } else {
    const mocks: Record<string, string> = isEn ? {
      sales: `Hello ${userName}! 💼 Sales Agent at ${business.name}. How can I help?`,
      support: `Hi ${userName}! 😊 Customer Support at ${business.name}.`,
      technical: `Hello ${userName}! 🔧 Tech Support at ${business.name}. What's the issue?`,
      orders: `Hi ${userName}! 📦 Order tracking at ${business.name}.`,
      reservations: `Hello ${userName}! 📅 Book with ${business.name} now.`,
    } : {
      sales: `أهلاً ${userName}! 💼 موظف مبيعات ${business.name}.`,
      support: `مرحباً ${userName}! 😊 خدمة عملاء ${business.name}.`,
      technical: `أهلاً ${userName}! 🔧 الدعم الفني في ${business.name}.`,
      orders: `مرحباً ${userName}! 📦 متابعة الطلبات في ${business.name}.`,
      reservations: `أهلاً ${userName}! 📅 الحجز في ${business.name}.`,
    };
    reply = mocks[agent.agentType] ?? (isEn ? `Hello ${userName}!` : `أهلاً ${userName}!`);
  }

  await db.message.create({ data: { conversationId: conv!.id, role: "assistant", content: reply } });
  await db.conversation.update({ where: { id: conv!.id }, data: { updatedAt: new Date() } });
  await sendTelegramMessage(botToken, chatId, reply);

  return NextResponse.json({ ok: true });
}

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
