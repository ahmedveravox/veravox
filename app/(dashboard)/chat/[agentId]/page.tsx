"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AGENT_META: Record<string, { icon: string; label: string; labelEn: string; color: string; desc: string; descEn: string }> = {
  sales:        { icon: "💼", label: "موظف مبيعات",  labelEn: "Sales Agent",         color: "#4ade80", desc: "يغلق الصفقات ويقنع العملاء",     descEn: "Closes deals & converts leads" },
  support:      { icon: "💬", label: "خدمة العملاء", labelEn: "Customer Support",     color: "#60a5fa", desc: "رد 24/7 ودعم كامل",              descEn: "24/7 responses & full support" },
  technical:    { icon: "🔧", label: "دعم فني",      labelEn: "Technical Support",    color: "#c084fc", desc: "يحل المشاكل التقنية",            descEn: "Solves technical issues step-by-step" },
  marketing:    { icon: "🎨", label: "تسويق وإبداع", labelEn: "Marketing & Creative", color: "#f472b6", desc: "حملات وأفكار إبداعية",           descEn: "Campaigns & creative ideas" },
  social:       { icon: "📱", label: "سوشال ميديا",  labelEn: "Social Media",         color: "#fcd34d", desc: "محتوى وتفاعل يومي",             descEn: "Daily content & engagement" },
  analyst:      { icon: "📊", label: "محلل أعمال",   labelEn: "Business Analyst",     color: "#2dd4bf", desc: "تقارير واستراتيجيات",           descEn: "Reports & growth strategies" },
  manager:      { icon: "🧠", label: "مدير AI",      labelEn: "AI Manager",           color: "#f87171", desc: "قرارات وأولويات",               descEn: "Decisions & priorities" },
  orders:       { icon: "📦", label: "موظف الطلبات", labelEn: "Orders Agent",         color: "#fb923c", desc: "شحن ومتابعة ومرتجعات",          descEn: "Shipping & returns tracking" },
  reservations: { icon: "📅", label: "الحجوزات",     labelEn: "Reservations",         color: "#818cf8", desc: "مواعيد وتأكيدات فورية",         descEn: "Bookings & instant confirmations" },
  invoices:     { icon: "🧾", label: "الفواتير",     labelEn: "Invoices & Payments",  color: "#facc15", desc: "فواتير ومتابعة المدفوعات",      descEn: "Invoices & payment follow-up" },
};

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

interface AgentInfo {
  id: string;
  agentType: string;
  business: { name: string; dialect?: string };
}

export default function ChatPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const router = useRouter();
  const [agent, setAgent]         = useState<AgentInfo | null>(null);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [streaming, setStreaming] = useState(false);
  const [convId, setConvId]       = useState<string | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const textareaRef     = useRef<HTMLTextAreaElement>(null);
  const streamContent   = useRef("");

  useEffect(() => { fetchAgent(); }, [agentId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function fetchAgent() {
    try {
      const res = await fetch(`/api/agents/${agentId}`);
      if (!res.ok) { router.push("/dashboard"); return; }
      const data: AgentInfo = await res.json();
      setAgent(data);
      const meta = AGENT_META[data.agentType];
      const isEn = data.business?.dialect === "en";
      if (meta) {
        setMessages([{
          role: "assistant",
          content: isEn
            ? `Hello! I'm your ${meta.labelEn} at ${data.business.name} ${meta.icon}\n${meta.descEn}.\n\nHow can I help you today?`
            : `أهلاً! أنا ${meta.label} في ${data.business.name} ${meta.icon}\n${meta.desc}.\n\nكيف أستطيع مساعدتك اليوم؟`,
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
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: Message = { role: "user", content: userMessage, id: Date.now().toString() };
    setMessages(prev => [...prev, userMsg]);
    setStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    streamContent.current = "";
    setMessages(prev => [...prev, { role: "assistant", content: "", id: assistantId }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, message: userMessage, conversationId: convId }),
      });

      if (!res.ok || !res.body) {
        let errMsg = "عذراً، حدث خطأ. حاول مرة أخرى.";
        try {
          const errData = await res.clone().json();
          if (errData.error === "trial_expired") errMsg = "⏰ انتهت فترة التجربة المجانية. يرجى الترقية لمواصلة المحادثات.";
          else if (errData.error === "trial_limit")  errMsg = "📊 وصلت لحد الـ 200 رسالة في التجربة المجانية. يرجى الترقية.";
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
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              streamContent.current += data.text;
              const snap = streamContent.current;
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: snap } : m));
            }
            if (data.conversationId) setConvId(data.conversationId);
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
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 130) + "px";
  }

  const meta   = agent ? (AGENT_META[agent.agentType] ?? { icon: "🤖", label: agent.agentType, labelEn: agent.agentType, color: "#f59e0b", desc: "", descEn: "" }) : null;
  const isEn   = agent?.business?.dialect === "en";

  if (loadingAgent) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16, animation: "float 2s ease-in-out infinite" }}>🤖</div>
          <div style={{ color: "rgba(240,244,255,0.4)", fontSize: 14 }}>جاري تحميل الموظف...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "calc(100vh - 116px)",
      maxWidth: 820, margin: "0 auto",
    }}>

      {/* ── Agent Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 20px",
        background: "rgba(10,16,32,0.9)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 18, marginBottom: 14, flexShrink: 0,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          width: 50, height: 50, borderRadius: 15, flexShrink: 0,
          background: meta ? `${meta.color}15` : "rgba(245,158,11,0.1)",
          border: `1px solid ${meta?.color ?? "#f59e0b"}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26,
          boxShadow: `0 0 24px ${meta?.color ?? "#f59e0b"}12`,
        }}>{meta?.icon ?? "🤖"}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: "#f0f4ff", marginBottom: 2 }}>
            {isEn ? meta?.labelEn : meta?.label}
          </div>
          <div style={{ fontSize: 12, color: "rgba(240,244,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {agent?.business.name} · {isEn ? meta?.descEn : meta?.desc}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="status-dot-live"/>
            <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>{isEn ? "Active" : "نشط"}</span>
          </div>
          <Link href="/dashboard" style={{
            fontSize: 11, color: "rgba(240,244,255,0.3)", textDecoration: "none",
          }}>← {isEn ? "Back" : "رجوع"}</Link>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: "auto", display: "flex",
        flexDirection: "column", gap: 12,
        padding: "4px 2px 16px",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(245,158,11,0.15) transparent",
      }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isLast = idx === messages.length - 1;
          return (
            <div key={msg.id} className={isLast ? "fade-in-fast" : ""} style={{
              display: "flex",
              justifyContent: isUser ? "flex-start" : "flex-end",
              alignItems: "flex-end", gap: 8,
            }}>
              {/* Assistant avatar */}
              {!isUser && (
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: `${meta?.color ?? "#f59e0b"}15`,
                  border: `1px solid ${meta?.color ?? "#f59e0b"}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, marginLeft: 4,
                }}>{meta?.icon ?? "🤖"}</div>
              )}

              {/* Bubble */}
              <div style={{
                maxWidth: "72%",
                padding: "13px 17px",
                // User = right side (RTL flex-start), tail at bottom-right → BR small
                // Asst = left side (RTL flex-end), tail at bottom-left → BL small
                borderRadius: isUser
                  ? "18px 18px 4px 18px"   // user: tail bottom-right (RTL right side)
                  : "18px 18px 18px 4px",   // asst: tail bottom-left (RTL left side)
                background: isUser
                  ? "linear-gradient(135deg, #f59e0b, #d97706)"
                  : "rgba(12,19,38,0.95)",
                border: !isUser ? "1px solid rgba(255,255,255,0.07)" : "none",
                color: isUser ? "#0a0f1e" : "#f0f4ff",
                fontSize: 15, lineHeight: 1.75,
                whiteSpace: "pre-wrap",
                boxShadow: isUser
                  ? "0 4px 16px rgba(245,158,11,0.2)"
                  : "0 2px 12px rgba(0,0,0,0.3)",
                wordBreak: "break-word",
              }}>
                {msg.content || (
                  <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} className="typing-dot" style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "rgba(240,244,255,0.4)",
                      }}/>
                    ))}
                  </div>
                )}
              </div>

              {/* User avatar */}
              {isUser && (
                <div style={{
                  width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                  background: "rgba(245,158,11,0.15)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "#f59e0b", fontWeight: 700,
                  marginRight: 4,
                }}>أ</div>
              )}
            </div>
          );
        })}

        {/* Streaming indicator */}
        {streaming && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(240,244,255,0.3)", fontSize: 13, paddingRight: 46 }}>
            <span className="pulse-gold" style={{ color: meta?.color ?? "#f59e0b" }}>●</span>
            {isEn ? "Thinking..." : "يفكر..."}
          </div>
        )}

        <div ref={messagesEndRef}/>
      </div>

      {/* ── Input Bar ── */}
      <div style={{
        background: "rgba(10,16,32,0.92)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18, padding: "10px 12px",
        display: "flex", alignItems: "flex-end", gap: 10,
        flexShrink: 0, backdropFilter: "blur(12px)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.2)",
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={isEn ? "Type your message... (Enter to send)" : "اكتب رسالتك... (Enter للإرسال)"}
          rows={1}
          style={{
            flex: 1, background: "transparent", border: "none",
            color: "#f0f4ff", fontSize: 15, outline: "none",
            resize: "none", fontFamily: "inherit", lineHeight: 1.65,
            maxHeight: 130, overflowY: "auto",
            scrollbarWidth: "none",
            padding: "4px 0",
          }}
        />

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Shift+Enter hint */}
          {input.length > 0 && (
            <span style={{ fontSize: 11, color: "rgba(240,244,255,0.2)", whiteSpace: "nowrap" }}>
              {isEn ? "Shift+↵ newline" : "Shift+Enter للسطر التالي"}
            </span>
          )}

          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            style={{
              width: 42, height: 42, borderRadius: 13, border: "none",
              background: streaming || !input.trim()
                ? "rgba(245,158,11,0.15)"
                : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: streaming || !input.trim() ? "rgba(245,158,11,0.4)" : "#0a0f1e",
              cursor: streaming || !input.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 19, flexShrink: 0,
              transition: "all 0.2s ease",
              boxShadow: !streaming && input.trim() ? "0 4px 16px rgba(245,158,11,0.3)" : "none",
            }}>
            {streaming ? "⏳" : "↑"}
          </button>
        </div>
      </div>

      {/* Quick suggestions for empty state */}
      {messages.length === 1 && !streaming && (
        <div className="fade-in" style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(isEn
            ? ["Tell me about your products", "How can I place an order?", "What's your return policy?"]
            : ["أخبرني عن منتجاتك", "كيف أطلب؟", "ما هي سياسة الإرجاع؟"]
          ).map((s, i) => (
            <button key={i} onClick={() => { setInput(s); textareaRef.current?.focus(); }} style={{
              padding: "7px 14px", borderRadius: 20, fontSize: 13,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
              color: "rgba(240,244,255,0.5)", cursor: "pointer", fontFamily: "inherit",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(245,158,11,0.3)"; (e.target as HTMLButtonElement).style.color = "#f59e0b"; }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.target as HTMLButtonElement).style.color = "rgba(240,244,255,0.5)"; }}
            >{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}
