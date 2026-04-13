import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildSystemPrompt } from "@/lib/ai/orchestrator";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { agentId, message, conversationId } = await req.json();
  if (!agentId || !message?.trim()) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  // ── Trial limit: 7 days OR 200 messages ──────────────────────────────
  const subscription = await db.subscription.findUnique({ where: { userId: session.user.id } });
  if (subscription?.status === "trial") {
    const trialExpired = new Date(subscription.trialEnds) < new Date();
    if (trialExpired) {
      return NextResponse.json({ error: "trial_expired", message: "انتهت فترة التجربة. يرجى الترقية للاستمرار." }, { status: 403 });
    }
    const msgCount = await db.message.count({
      where: { conversation: { userId: session.user.id } },
    });
    if (msgCount >= 200) {
      return NextResponse.json({ error: "trial_limit", message: "وصلت لحد الـ 200 رسالة في التجربة المجانية. يرجى الترقية." }, { status: 403 });
    }
  }

  // Get agent + business
  const agent = await db.businessAgent.findFirst({
    where: { id: agentId, business: { userId: session.user.id } },
    include: { business: true },
  });

  if (!agent) {
    return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 });
  }

  // Find or create conversation
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
        title: message.slice(0, 60),
        messages: { create: { role: "user", content: message } },
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  } else {
    await db.message.create({
      data: { conversationId: conv.id, role: "user", content: message },
    });
    conv = await db.conversation.findFirst({
      where: { id: conv.id },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 40 } },
    });
  }

  const systemPrompt = buildSystemPrompt(agent.agentType, agent.business);

  // If no Anthropic API key, use smart mock responses
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const mockReply = getMockReply(agent.agentType, message, agent.business.name);
    await db.message.create({
      data: { conversationId: conv!.id, role: "assistant", content: mockReply },
    });

    return new Response(
      new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          const words = mockReply.split(" ");
          let i = 0;
          const interval = setInterval(() => {
            if (i < words.length) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: words[i] + (i < words.length - 1 ? " " : "") })}\n\n`));
              i++;
            } else {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: conv!.id })}\n\n`));
              clearInterval(interval);
              controller.close();
            }
          }, 40);
        },
      }),
      { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
    );
  }

  // Real Anthropic streaming
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey });

  const historyMessages = (conv?.messages ?? [])
    .filter(m => m.role === "user" || m.role === "assistant")
    .slice(-20)
    .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: historyMessages,
  });

  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            const text = chunk.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        // Save assistant response
        await db.message.create({
          data: { conversationId: conv!.id, role: "assistant", content: fullResponse },
        });
        await db.conversation.update({
          where: { id: conv!.id }, data: { updatedAt: new Date() },
        });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: conv!.id })}\n\n`));
      } catch (err) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "خطأ في الاتصال" })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

function getMockReply(agentType: string, message: string, businessName: string): string {
  const replies: Record<string, string[]> = {
    sales: [
      `أهلاً! أنا موظف المبيعات في ${businessName} 💼 يسعدني مساعدتك. ما الذي يثير اهتمامك لدينا؟`,
      `ممتاز! لدينا عروض رائعة الآن. هل تريد معرفة التفاصيل أو إرسال رابط الدفع؟`,
      `بالتأكيد! هذا المنتج من أفضل ما لدينا. سأرسل لك رابط الطلب مباشرة 🛒`,
    ],
    support: [
      `مرحباً! أنا هنا لمساعدتك في ${businessName} 😊 كيف أستطيع خدمتك؟`,
      `فهمت مشكلتك. سأحلها لك فوراً. هل يمكنك إعطائي مزيداً من التفاصيل؟`,
      `تمام! تم حل الموضوع. هل هناك شيء آخر أستطيع مساعدتك به؟`,
    ],
    technical: [
      `أهلاً! أنا الدعم الفني في ${businessName} 🔧 أخبرني بالمشكلة وسأحلها خطوة بخطوة`,
      `هذه مشكلة شائعة. الحل بسيط: أولاً تأكد من... هل جربت إعادة التشغيل؟`,
    ],
    marketing: [
      `واو! أحب الإبداع 🎨 إليك فكرة رائعة لحملة "${businessName}": استهدف عملاءك بمحتوى عاطفي يعكس قيم نشاطك`,
      `هذه فكرة حملة مميزة! أقترح استخدام قصص العملاء الحقيقيين مع صور احترافية.`,
    ],
    social: [
      `للسوشال ميديا 📱 أنصح بنشر 3-5 مرات أسبوعياً. إليك محتوى جاهز لـ${businessName}:`,
      `هاشتاق رائع! أضف أيضاً: #السعودية #متجر_إلكتروني وهاشتاق اسم نشاطك`,
    ],
    analyst: [
      `بناءً على التحليل 📊 أرى فرصاً نمو واضحة في ${businessName}. أبرز الملاحظات:`,
      `الأرقام تقول الكثير! أداء النشاط جيد. للتحسين أوصي بـ...`,
    ],
    manager: [
      `كمدير AI لـ${businessName} 🧠 أوصي بالتركيز على 3 أولويات هذا الأسبوع:`,
      `القرار الاستراتيجي الصحيح هو... بناءً على أداء الفريق والأرقام الحالية`,
    ],
    orders: [
      `أتابع طلبك الآن 📦 رقم الطلب موجود في نظامنا. الحالة الحالية:`,
      `طلبك في الطريق! التوصيل المتوقع خلال 2-3 أيام. هل تريد تحديثات؟`,
    ],
    reservations: [
      `تم تأكيد حجزك في ${businessName} 📅 سنرسل لك تذكيراً قبل 24 ساعة`,
      `بالتأكيد! الموعد المتاح في... هل هذا يناسبك؟`,
    ],
    invoices: [
      `فاتورتك جاهزة 🧾 المبلغ المستحق... يمكنك الدفع عبر الرابط التالي:`,
      `تم استلام دفعتك بنجاح! شكراً لتعاملك مع ${businessName} ✅`,
    ],
  };

  const agentReplies = replies[agentType] ?? [`أهلاً بك في ${businessName}! كيف أستطيع مساعدتك؟`];
  const idx = Math.floor(Math.random() * agentReplies.length);
  return agentReplies[idx];
}
