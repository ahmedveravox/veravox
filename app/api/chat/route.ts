import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildSystemPrompt } from "@/lib/ai/orchestrator";
import { streamGemini, historyToGemini } from "@/lib/ai/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await req.json();
  const { agentId, message, conversationId, imageBase64, imageMimeType } = body;

  if (!agentId || (!message?.trim() && !imageBase64)) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const userText: string = message?.trim() ?? "";

  // ── Trial limit: 7 days OR 200 messages ──────────────────────
  const subscription = await db.subscription.findUnique({ where: { userId: session.user.id } });
  if (subscription?.status === "trial") {
    if (new Date(subscription.trialEnds) < new Date()) {
      return NextResponse.json({ error: "trial_expired" }, { status: 403 });
    }
    const msgCount = await db.message.count({
      where: { conversation: { userId: session.user.id } },
    });
    if (msgCount >= 200) {
      return NextResponse.json({ error: "trial_limit" }, { status: 403 });
    }
  }

  const agent = await db.businessAgent.findFirst({
    where: { id: agentId, business: { userId: session.user.id } },
    include: { business: true },
  });
  if (!agent) return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 });

  const storedContent = imageBase64
    ? `${userText ? userText + "\n" : ""}[صورة مرفقة]`
    : userText;

  // Find / create conversation
  let conv;
  if (conversationId) {
    conv = await db.conversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 40 } },
    });
  }
  if (!conv) {
    conv = await db.conversation.create({
      data: {
        userId: session.user.id,
        agentId: agent.id,
        title: (userText || "صورة").slice(0, 60),
        messages: { create: { role: "user", content: storedContent } },
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  } else {
    await db.message.create({
      data: { conversationId: conv.id, role: "user", content: storedContent },
    });
    conv = await db.conversation.findFirst({
      where: { id: conv.id },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 40 } },
    });
  }

  const systemPrompt = buildSystemPrompt(agent.agentType, agent.business);
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // ── No API key → mock ─────────────────────────────────────────
  if (!geminiKey && !anthropicKey) {
    const mockReply = getMockReply(agent.agentType, userText, agent.business.name);
    await db.message.create({ data: { conversationId: conv!.id, role: "assistant", content: mockReply } });
    return streamMock(mockReply, conv!.id);
  }

  // ── SSE stream ────────────────────────────────────────────────
  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      const send = (payload: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));

      try {
        const historyMsgs = (conv?.messages ?? [])
          .filter(m => m.role === "user" || m.role === "assistant")
          .slice(-20);

        // ── Try Gemini first ──────────────────────────────────
        if (geminiKey) {
          const geminiHistory = historyToGemini(historyMsgs.slice(0, -1));
          await streamGemini({
            apiKey: geminiKey,
            systemPrompt,
            history: geminiHistory,
            userText,
            imageBase64,
            imageMimeType,
            onChunk: (text) => { fullResponse += text; send({ text }); },
            onDone: () => {},
          });
        }
        // ── Fallback to Anthropic ─────────────────────────────
        else if (anthropicKey) {
          const Anthropic = (await import("@anthropic-ai/sdk")).default;
          const client = new Anthropic({ apiKey: anthropicKey });

          type APart = { type: string; [k: string]: unknown };
          type AMsg = { role: "user" | "assistant"; content: string | APart[] };
          const msgs: AMsg[] = historyMsgs.slice(0, -1).map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

          if (imageBase64) {
            const mime = (imageMimeType ?? "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
            const parts: APart[] = [{ type: "image", source: { type: "base64", media_type: mime, data: imageBase64 } }];
            if (userText) parts.push({ type: "text", text: userText });
            msgs.push({ role: "user", content: parts });
          } else {
            msgs.push({ role: "user", content: userText });
          }

          const stream = await client.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 1024,
            system: systemPrompt,
            messages: msgs as Parameters<typeof client.messages.stream>[0]["messages"],
          });

          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              fullResponse += chunk.delta.text;
              send({ text: chunk.delta.text });
            }
          }
        }

        // Save + done
        await db.message.create({ data: { conversationId: conv!.id, role: "assistant", content: fullResponse } });
        await db.conversation.update({ where: { id: conv!.id }, data: { updatedAt: new Date() } });
        send({ done: true, conversationId: conv!.id });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "خطأ";
        send({ error: msg });
        // Save whatever we got so far
        if (fullResponse) {
          await db.message.create({ data: { conversationId: conv!.id, role: "assistant", content: fullResponse } }).catch(() => {});
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

function streamMock(reply: string, convId: string): Response {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        const words = reply.split(" ");
        let i = 0;
        const iv = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: words[i] + (i < words.length - 1 ? " " : "") })}\n\n`));
            i++;
          } else {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: convId })}\n\n`));
            clearInterval(iv);
            controller.close();
          }
        }, 40);
      },
    }),
    { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
  );
}

function getMockReply(agentType: string, _message: string, businessName: string): string {
  const replies: Record<string, string[]> = {
    sales:        [`أهلاً! أنا موظف المبيعات في ${businessName} 💼 كيف أستطيع مساعدتك؟`, `ممتاز! لدينا عروض رائعة الآن. ما الذي يثير اهتمامك؟`],
    support:      [`مرحباً! أنا خدمة عملاء ${businessName} 😊 كيف أخدمك؟`, `فهمت مشكلتك. هل يمكنك إعطائي مزيداً من التفاصيل؟`],
    technical:    [`أهلاً! الدعم الفني لـ${businessName} معك 🔧 أخبرني بالمشكلة.`],
    marketing:    [`أحب الإبداع! 🎨 إليك فكرة حملة رائعة لـ${businessName}:`],
    social:       [`للسوشال ميديا 📱 أنصح بنشر 3-5 مرات أسبوعياً.`],
    analyst:      [`بناءً على التحليل 📊 أرى فرصاً نمو واضحة في ${businessName}.`],
    manager:      [`كمدير AI لـ${businessName} 🧠 أوصي بـ 3 أولويات هذا الأسبوع:`],
    orders:       [`أتابع طلبك الآن 📦 هل تريد إدخال رقم الطلب؟`],
    reservations: [`يمكنك الحجز في ${businessName} 📅 ما الوقت المناسب لك؟`],
    invoices:     [`فاتورتك جاهزة 🧾 يمكنك الدفع عبر الرابط.`],
  };
  const opts = replies[agentType] ?? [`أهلاً بك في ${businessName}! كيف أستطيع مساعدتك؟`];
  return opts[Math.floor(Math.random() * opts.length)];
}
