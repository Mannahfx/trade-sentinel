import { useEffect, useRef, useState } from "react";
import { Bot, RotateCcw, Send, User } from "lucide-react";
import type { ChatMessage, Trade } from "@/lib/trading/types";
import { stats } from "@/lib/trading/analysis";
import { GlassCard } from "./primitives";
import { cn } from "@/lib/utils";

function buildContext(trades: Trade[]) {
  const s = stats(trades);
  return JSON.stringify({
    summary: {
      totalTrades: s.total,
      wins: s.wins,
      losses: s.losses,
      winRatePct: s.winRate === null ? null : Math.round(s.winRate),
      avgR: s.avgR,
      totalR: s.totalR,
      takeYesCount: s.takeYes,
    },
    trades: trades.slice(0, 120).map((t) => ({
      datetime: t.datetime,
      instrument: t.instrument,
      direction: t.direction,
      zoneType: t.zoneType,
      htfZoneTf: t.htfZoneTf,
      entryTf: t.entryTf,
      entryTrigger: t.entryTrigger,
      algoStructure4H: t.algoStructure,
      zoneQuality: t.zoneQuality,
      slSize: t.slSize,
      plannedR: t.plannedR,
      resultR: t.resultR,
      outcome: t.outcome,
      mistakes: t.mistakes,
      whyTaken: t.whyTaken,
      improvement: t.improvement,
      takeTrade: t.takeTrade,
    })),
  });
}

export function MentorChat({
  trades,
  messages,
  setMessages,
  persist,
  clear,
}: {
  trades: Trade[];
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  persist: (next: ChatMessage[]) => ChatMessage[];
  clear: () => void;
}) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();
    const history = [...messages.filter((m) => m.id !== "seed"), userMsg];

    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          context: buildContext(trades),
        }),
      });

      if (!res.ok || !res.body) {
        const detail = await res.text().catch(() => "");
        throw new Error(detail || "The mentor could not respond.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)),
        );
      }

      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: acc || "I finished thinking but produced no text. Try rephrasing." }
            : m,
        );
        persist(next);
        return next;
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setMessages((prev) => {
        const next = prev.map((m) => (m.id === assistantId ? { ...m, content: message } : m));
        persist(next);
        return next;
      });
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  return (
    <GlassCard className="flex flex-col overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-glass-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-electric/15 text-electric">
            <Bot className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold">AI Trading Mentor</p>
            <p className="truncate text-[11px] text-muted-foreground">
              Reading {trades.length} saved trade{trades.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={clear}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-glass-border bg-glass px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      <div ref={scrollRef} className="scroll-slim h-72 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-2.5", m.role === "user" && "justify-end")}>
            {m.role === "assistant" ? (
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-electric/15 text-electric">
                <Bot className="h-3.5 w-3.5" />
              </span>
            ) : null}
            <div
              className={cn(
                "max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap",
                m.role === "user"
                  ? "rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-primary-foreground"
                  : "text-foreground/90",
              )}
            >
              {m.content || (busy ? <span className="text-muted-foreground">Thinking…</span> : null)}
            </div>
            {m.role === "user" ? (
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-glass text-muted-foreground">
                <User className="h-3.5 w-3.5" />
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="border-t border-glass-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-glass-border bg-surface-strong p-2 transition-colors focus-within:border-electric">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Ask your Mentor to analyze your data..."
            className="scroll-slim max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <button
            type="button"
            onClick={() => void send()}
            disabled={busy || !input.trim()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground transition-all duration-200 hover:shadow-electric-glow disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
