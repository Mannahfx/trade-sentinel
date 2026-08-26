import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      }),
    )
    .max(60),
  context: z.string().max(60000),
});

const SYSTEM_PROMPT = `You are an elite trading mentor embedded in a trader's journal dashboard.
You analyze the trader's own logged trades (synthetic indices, smart-money concepts: FVG/OB zones,
HTF zone timeframes, entry triggers, 4H algorithmic structure grades, zone quality grades, mistake tags).
Rules:
- Ground every claim in the supplied dataset. Quote real counts, win rates and average R.
- Highlight which factor combinations have historically WON and which have LOST for this trader.
- Call out recurring mistake tags and their cost in R.
- Be direct and concise. Use short paragraphs or tight bullet lists. No filler, no disclaimers.
- If the dataset is empty or too small, say so plainly and tell them what to log next.`;

export const Route = createFileRoute("/api/mentor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("AI is not configured.", { status: 500 });
        }

        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return new Response("Invalid request.", { status: 400 });
        }

        const input = [
          {
            role: "developer" as const,
            content: [{ type: "input_text" as const, text: SYSTEM_PROMPT }],
          },
          {
            role: "user" as const,
            content: [
              {
                type: "input_text" as const,
                text: `Here is my current trading dataset (JSON summary):\n\n${parsed.context}`,
              },
            ],
          },
          ...parsed.messages.map((m) =>
            m.role === "assistant"
              ? {
                  role: "assistant" as const,
                  content: [{ type: "output_text" as const, text: m.content }],
                }
              : {
                  role: "user" as const,
                  content: [{ type: "input_text" as const, text: m.content }],
                },
          ),
        ];

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          signal: request.signal,
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-5.6-sol",
            input,
            stream: true,
            store: false,
            reasoning: { effort: "low", summary: "auto" },
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          const message =
            upstream.status === 429
              ? "Rate limited — wait a moment and ask again."
              : upstream.status === 402
                ? "AI credits are exhausted for this workspace."
                : `Mentor unavailable (${upstream.status}). ${detail.slice(0, 200)}`;
          return new Response(message, { status: upstream.status || 500 });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  if (!line.startsWith("data:")) continue;
                  const payload = line.slice(5).trim();
                  if (!payload || payload === "[DONE]") continue;
                  try {
                    const event = JSON.parse(payload) as {
                      type?: string;
                      delta?: string;
                    };
                    if (event.type === "response.output_text.delta" && event.delta) {
                      controller.enqueue(encoder.encode(event.delta));
                    }
                  } catch {
                    /* ignore partial frames */
                  }
                }
              }
            } catch (error) {
              console.error("mentor stream error", error);
            } finally {
              controller.close();
              reader.releaseLock();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
