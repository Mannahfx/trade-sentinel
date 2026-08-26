import { useCallback, useEffect, useState } from "react";
import type { ChatMessage, Trade } from "./types";

const TRADES_KEY = "td.trades.v1";
const CHAT_KEY = "td.chat.v1";

export const SEED_MESSAGE: ChatMessage = {
  id: "seed",
  role: "assistant",
  content:
    "I have analyzed your saved trades. What would you like to know about your win probabilities or mistakes?",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — ignore */
  }
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTrades(read<Trade[]>(TRADES_KEY, []));
    setHydrated(true);
  }, []);

  const addTrade = useCallback((trade: Trade) => {
    setTrades((prev) => {
      const next = [trade, ...prev];
      write(TRADES_KEY, next);
      return next;
    });
  }, []);

  const removeTrade = useCallback((id: string) => {
    setTrades((prev) => {
      const next = prev.filter((t) => t.id !== id);
      write(TRADES_KEY, next);
      return next;
    });
  }, []);

  return { trades, hydrated, addTrade, removeTrade };
}

export function useMentorChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([SEED_MESSAGE]);

  useEffect(() => {
    const stored = read<ChatMessage[] | null>(CHAT_KEY, null);
    if (stored && stored.length) setMessages(stored);
  }, []);

  const persist = useCallback((next: ChatMessage[]) => {
    write(CHAT_KEY, next);
    return next;
  }, []);

  const clear = useCallback(() => {
    setMessages(persist([SEED_MESSAGE]));
  }, [persist]);

  return { messages, setMessages, persist, clear };
}
