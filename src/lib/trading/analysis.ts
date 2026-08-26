import type { Trade, TradeDraft } from "./types";

export type HistoryLine = {
  label: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number | null;
  avgR: number | null;
  tone: "win" | "loss" | "neutral";
  note: string;
};

export type Verdict = {
  decision: "YES" | "NO" | "NO DATA";
  headline: string;
  exact: HistoryLine | null;
  partials: HistoryLine[];
  blockers: string[];
};

/** Trades that were actually taken and resolved. */
function resolved(trades: Trade[]) {
  return trades.filter((t) => t.outcome === "Win" || t.outcome === "Loss" || t.outcome === "BE");
}

function summarize(label: string, matched: Trade[]): HistoryLine {
  const wins = matched.filter((t) => t.outcome === "Win").length;
  const losses = matched.filter((t) => t.outcome === "Loss").length;
  const rs = matched.map((t) => t.resultR).filter((r): r is number => typeof r === "number");
  const avgR = rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : null;
  const decided = wins + losses;
  const winRate = decided ? (wins / decided) * 100 : null;

  let tone: HistoryLine["tone"] = "neutral";
  let note = "No data yet";
  if (matched.length > 0) {
    const profitable = (avgR ?? 0) > 0 && (winRate ?? 0) >= 50;
    const losing = (avgR ?? 0) < 0 || (winRate ?? 0) < 50;
    if (profitable) {
      tone = "win";
      note = "WON before";
    } else if (losing) {
      tone = "loss";
      note = "LOST before";
    }
  }

  return { label, trades: matched.length, wins, losses, winRate, avgR, tone, note };
}

export function comboLabel(d: Pick<TradeDraft, "zoneQuality" | "algoStructure" | "zoneType" | "entryTrigger" | "htfZoneTf" | "entryTf">) {
  return `${d.zoneQuality} + ${d.zoneType} + ${d.entryTrigger} on ${d.htfZoneTf}\u2192${d.entryTf} (4H struct ${d.algoStructure})`;
}

export function evaluate(draft: TradeDraft, trades: Trade[]): Verdict {
  const pool = resolved(trades);
  const blockers = draft.mistakes.length
    ? [`Mistake tags selected: ${draft.mistakes.join(", ")}`]
    : [];

  const exactMatches = pool.filter(
    (t) =>
      t.zoneQuality === draft.zoneQuality &&
      t.algoStructure === draft.algoStructure &&
      t.zoneType === draft.zoneType &&
      t.entryTrigger === draft.entryTrigger &&
      t.htfZoneTf === draft.htfZoneTf &&
      t.entryTf === draft.entryTf,
  );

  const exact = exactMatches.length ? summarize(comboLabel(draft), exactMatches) : null;

  const partials: HistoryLine[] = [
    summarize(
      `Zone Quality ${draft.zoneQuality}`,
      pool.filter((t) => t.zoneQuality === draft.zoneQuality),
    ),
    summarize(
      `4H Algo Structure ${draft.algoStructure}`,
      pool.filter((t) => t.algoStructure === draft.algoStructure),
    ),
    summarize(
      `Zone type ${draft.zoneType}`,
      pool.filter((t) => t.zoneType === draft.zoneType),
    ),
    summarize(
      `Trigger ${draft.entryTrigger}`,
      pool.filter((t) => t.entryTrigger === draft.entryTrigger),
    ),
    summarize(
      `${draft.htfZoneTf}\u2192${draft.entryTf} pairing`,
      pool.filter((t) => t.htfZoneTf === draft.htfZoneTf && t.entryTf === draft.entryTf),
    ),
  ].filter((line) => line.trades > 0);

  if (blockers.length) {
    return {
      decision: "NO",
      headline: "Skip — a mistake tag is flagged on this setup.",
      exact,
      partials,
      blockers,
    };
  }

  if (exact) {
    if (exact.tone === "win") {
      return {
        decision: "YES",
        headline: `This exact combination has WON before — ${exact.wins}W / ${exact.losses}L, avg ${formatR(exact.avgR)}.`,
        exact,
        partials,
        blockers,
      };
    }
    if (exact.tone === "loss") {
      return {
        decision: "NO",
        headline: `This exact combination has LOST before — ${exact.wins}W / ${exact.losses}L, avg ${formatR(exact.avgR)}.`,
        exact,
        partials,
        blockers,
      };
    }
  }

  const drag = partials.filter((p) => p.tone === "loss").sort((a, b) => (a.avgR ?? 0) - (b.avgR ?? 0));
  const good = partials.filter((p) => p.tone === "win");

  if (!partials.length) {
    return {
      decision: "NO DATA",
      headline: "No history for this combination yet — log the trade and it will learn.",
      exact,
      partials,
      blockers,
    };
  }

  if (drag.length && drag.length >= good.length) {
    return {
      decision: "NO",
      headline: `No exact match. Closest history is negative — ${drag[0]!.label} is dragging it down.`,
      exact,
      partials,
      blockers,
    };
  }

  if (good.length) {
    return {
      decision: "YES",
      headline: `No exact match, but every close factor reads positive (${good.map((g) => g.label).join(", ")}).`,
      exact,
      partials,
      blockers,
    };
  }

  return {
    decision: "NO DATA",
    headline: "Not enough resolved trades on these factors yet.",
    exact,
    partials,
    blockers,
  };
}

export function formatR(r: number | null) {
  if (r === null || Number.isNaN(r)) return "—";
  return `${r > 0 ? "+" : ""}${r.toFixed(2)}R`;
}

export function stats(trades: Trade[]) {
  const total = trades.length;
  const takeYes = trades.filter((t) => t.takeTrade === "YES").length;
  const wins = trades.filter((t) => t.outcome === "Win").length;
  const losses = trades.filter((t) => t.outcome === "Loss").length;
  const decided = wins + losses;
  const winRate = decided ? (wins / decided) * 100 : null;
  const rs = trades.map((t) => t.resultR).filter((r): r is number => typeof r === "number");
  const avgR = rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : null;
  const totalR = rs.reduce((a, b) => a + b, 0);
  return { total, takeYes, wins, losses, winRate, avgR, totalR };
}
