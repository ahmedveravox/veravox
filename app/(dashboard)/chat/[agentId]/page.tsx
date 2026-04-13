"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";

const AGENT_META: Record<string, { icon: string; label: string; color: string; desc: string }> = {
  sales:        { icon: "💼", label: "موظف مبيعات", color: "#4ade80", desc: "يغلق الصفقات ويقنع العملاء" },
  support:      { icon: "💬", label: "خدمة العملاء", color: "#60a5fa", desc: "رد 24/7 ودعم كامل" },
  technical:    { icon: "🔧", label: "دعم فني", color: "#c084fc", desc: "يحل المشاكل التقنية" },
  marketing:    { icon: "🎨", label: "تسويق وإبداع", color: "#f472b6", desc: "حملات وأفكار إبداعية" },
  social:       { icon: "📱", label: "سوشال ميديا", color: "#fcd34d", desc: "محتوى وتفاعل يومي" },
  analyst:      { icon: "📊", label: "محلل أعمال", color: "#2dd4bf", desc: "تقارير واستراتيجيات" },
  manager:      { icon: "🧠", label: "مدير AI", color: "#f87171", desc: "قرارات وأولويات" },
  orders:       { icon: "📦", label: "موظف الطلبات", color: "#fb923c", desc: "شحن ومتابعة" },
  reservations: { icon: "📅", label: "الحجوزات", color: "#818cf8", desc: "مواعيد وتأكيدات" },
  invoices:     { icon: "🧾", label: "الفواتير", color: "#facc15", desc: "فواتير ومدفوعات" },
};

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface AgentInfo {
  id: string;
  agentType: string;
  business: { name: string };
}

export default function ChatPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const router = useRouter();
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamingContent = useRef("");

  useEffect(() => {
    fetchAgent();
  }, [agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchAgent() {
    try {
      const res = await fetch(`/api/agents/${agentId}`);
      if (!res.ok) { router.push("/dashboard"); return; }
      const data = await res.json();
      setAgent(data);
      const meta = AGENT_META[data.agentType];
      if (meta) {
        setMessages([{
          role: "assistant",
          content: `أهلاً! أنا ${meta.label} في ${data.business.name} ${meta.icon}\n${meta.desc}.\n\nكيف أستطيع مساعدتك اليوم؟`,
          id: "welcome",
        }]);
      }
    } finally {
      setLoadingAgent(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || streaming) return;
    const userMessage = input.trim();
    setInput("");

    const userMsg: Message = { role: "user", content: userMessage, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    streamingContent.current = "";
    setMessages(prev => [...prev, { role: "assistant", content: "", id: assistantId }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, message: userMessage, conversationId }),
      });

      if (!res.ok || !res.body) {
        let errMsg = "عذراً، حدث خطأ. حاول مرة أخرى.";
        try {
          const errData = await res.clone().json();
          if (errData.error === "trial_expired") errMsg = "⏰ انتهت فترة التجربة المجانية. يرجى الترقية لمواصلة المحادثات.";
          else if (errData.error === "trial_limit") errMsg = "📊 وصلت لحد الـ 200 رسالة في التجربة المجانية. يرجى الترقية من صفحة الباقات.";
        } catch { /* ignore */ }
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: errMsg } : m));
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              streamingContent.current += data.text;
              const current = streamingContent.current;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: current } : m));
            }
            if (data.conversationId) setConversationId(data.conversationId);
            if (data.done) setStreaming(false);
          } catch { /* ignore parse errors */ }
        }
      }
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: "خطأ في الاتصال. تأكد من الإنترنت وحاول مرة أخرى." } : m));
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const meta = agent ? (AGENT_META[agent.agentType] ?? { icon: "🤖", label: agent.agentType, color: "#f59e0b", desc: "" }) : null;

  if (loadingAgent) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center", color: "rgba(248,250,252,0.4)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <div>جاري التحميل...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 116px)",
      maxWidth: 800, margin: "0 auto",
    }}>
      {/* Agent Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "16px 20px",
        background: "rgba(30,41,59,0.8)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16, marginBottom: 16, flexShrink: 0,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: meta ? `${meta.color}18` : "rgba(245,158,11,0.1)",
          border: `1px solid ${meta?.color ?? "#f59e0b"}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24,
        }}>{meta?.icon ?? "🤖"}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#f8fafc" }}>{meta?.label ?? "AI"}</div>
          <div style={{ fontSize: 13, color: "rgba(248,250,252,0.45)" }}>{agent?.business.name ?? ""} · {meta?.desc ?? ""}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <span style={{ fontSize: 12, color: "#22c55e" }}>نشط</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 14,
        padding: "4px 4px 16px",
        scrollbarWidth: "thin",
      }}>
        {messages.map(msg => (
          <div key={msg.id} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-start" : "flex-end",
          }}>
            {msg.role === "assistant" && (
              <div style={{ fontSize: 22, marginLeft: 10, alignSelf: "flex-end", marginBottom: 4 }}>{meta?.icon ?? "🤖"}</div>
            )}
            <div style={{
              maxWidth: "75%",
              padding: "12px 16px",
              borderRadius: msg.role === "user" ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
              background: msg.role === "user"
                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                : "rgba(30,41,59,0.9)",
              border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.06)" : "none",
              color: msg.role === "user" ? "#0a0f1e" : "#f8fafc",
              fontSize: 15, lineHeight: 1.7,
              whiteSpace: "pre-wrap",
            }}>
              {msg.content || (
                <div style={{ display: "flex", gap: 5, padding: "2px 0", alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`typing-dot`} style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "rgba(248,250,252,0.4)",
                      animation: `typing-dot 1s infinite ${i * 150}ms`,
                    }} />
                  ))}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "rgba(245,158,11,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginRight: 10, alignSelf: "flex-end", flexShrink: 0,
                fontSize: 14, color: "#f59e0b",
              }}>أ</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        background: "rgba(30,41,59,0.9)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16, padding: "12px 14px",
        display: "flex", alignItems: "flex-end", gap: 10,
        flexShrink: 0,
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالتك... (Enter للإرسال)"
          rows={1}
          style={{
            flex: 1, background: "transparent", border: "none",
            color: "#f8fafc", fontSize: 15, outline: "none",
            resize: "none", fontFamily: "inherit", lineHeight: 1.6,
            maxHeight: 120, overflowY: "auto",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={streaming || !input.trim()}
          style={{
            width: 42, height: 42, borderRadius: 12, border: "none",
            background: streaming || !input.trim()
              ? "rgba(245,158,11,0.2)"
              : "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#0a0f1e", cursor: streaming || !input.trim() ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0, transition: "all 0.2s ease",
          }}>
          {streaming ? "⏳" : "↑"}
        </button>
      </div>

      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
