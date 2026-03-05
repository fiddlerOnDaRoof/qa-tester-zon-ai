/**
 * AI adapter — uses xAI (Grok) API via fetch (OpenAI-compatible).
 * Model: grok-3
 */

const OPENAI_API_URL = "https://api.x.ai/v1/chat/completions";
const MODEL = "grok-3";

type ChatMessage = { role: "user" | "assistant"; content: string };

function buildMessages(
  messages: ChatMessage[],
  systemPrompt: string
): Array<{ role: string; content: string }> {
  return [{ role: "system", content: systemPrompt }, ...messages];
}

export async function streamChat(
  messages: ChatMessage[],
  systemPrompt = "You are a professional QA tester AI assistant."
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages: buildMessages(messages, systemPrompt),
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Grok API error ${res.status}: ${err}`);
  }

  const body = res.body;
  if (!body) throw new Error("No response body from Grok");

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const payload = trimmed.slice(6);
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload);
              const delta: string | undefined = json.choices?.[0]?.delta?.content;
              if (delta) {
                controller.enqueue(new TextEncoder().encode(delta));
              }
            } catch {
              // skip malformed SSE chunk
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

export async function chatCompletion(
  messages: ChatMessage[],
  systemPrompt = "You are a professional QA tester AI assistant."
): Promise<string> {
  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: buildMessages(messages, systemPrompt),
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Grok API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content as string) ?? "";
}
