// Google Gemini AI integration with streaming SSE support

export interface GeminiMessage {
  role: "user" | "model";
  parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
}

export async function streamGemini({
  apiKey,
  systemPrompt,
  history,
  userText,
  imageBase64,
  imageMimeType,
  onChunk,
  onDone,
}: {
  apiKey: string;
  systemPrompt: string;
  history: GeminiMessage[];
  userText: string;
  imageBase64?: string;
  imageMimeType?: string;
  onChunk: (text: string) => void;
  onDone: () => void;
}): Promise<string> {
  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  // Build the current user message parts
  const userParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
  if (imageBase64) {
    userParts.push({
      inlineData: { mimeType: imageMimeType ?? "image/jpeg", data: imageBase64 },
    });
  }
  if (userText) userParts.push({ text: userText });
  if (!userParts.length) userParts.push({ text: " " });

  const contents = [
    ...history,
    { role: "user", parts: userParts },
  ];

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { maxOutputTokens: 1024, temperature: 0.8 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok || !res.body) {
    const err = await res.text().catch(() => "unknown");
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (!raw || raw === "[DONE]") continue;
      try {
        const json = JSON.parse(raw);
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        if (text) {
          fullText += text;
          onChunk(text);
        }
      } catch { /* ignore malformed chunks */ }
    }
  }

  onDone();
  return fullText;
}

export function historyToGemini(
  messages: Array<{ role: string; content: string }>
): GeminiMessage[] {
  return messages.map(m => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));
}
