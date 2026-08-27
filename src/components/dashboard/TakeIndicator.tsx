import { CheckCircle2, CircleSlash, HelpCircle } from "lucide-react";
import type { HistoryLine, Verdict } from "@/lib/trading/analysis";
import { formatR } from "@/lib/trading/analysis";
import { GlassCard } from "./primitives";
import { cn } from "@/lib/utils";

function Line({ line, emphasized }: { line: HistoryLine; emphasized?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg border px-3 py-2 text-xs transition-colors",
        emphasized ? "border-glass-border bg-surface-strong" : "border-transparent bg-glass/40",
      )}
    >
      <span className="min-w-0 flex-1 truncate text-muted-foreground" title={line.label}>
        {line.label}
      </span>
      <span className="num shrink-0 text-muted-foreground/80">
        {line.trades}T · {line.wins}W / {line.losses}L
        {line.winRate !== null ? ` (${Math.round(line.winRate)}%)` : ""} · {formatR(line.avgR)}
      </span>
      <span
        className={cn(
          "shrink-0 text-[11px] font-semibold tracking-wide",
          line.tone === "win" && "text-bull",
          line.tone === "loss" && "text-bear",
          line.tone === "neutral" && "text-muted-foreground",
        )}
      >
        {line.note}
      </span>
    </div>
  );
}

export function TakeIndicator({ verdict }: { verdict: Verdict }) {
  const yes = verdict.decision === "YES";
  const no = verdict.decision === "NO";
  const Icon = yes ? CheckCircle2 : no ? CircleSlash : HelpCircle;

  return (
    <GlassCard className="overflow-hidden">
      <div
        className={cn(
          "relative flex flex-col items-center gap-2 px-6 py-7 text-center transition-all duration-300",
          yes && "bg-bull/10 shadow-bull-glow",
          no && "bg-bear/10 shadow-bear-glow",
          !yes && !no && "bg-glass/40",
        )}
      >
        <div
          className={cn(
            "animate-pulse-glow pointer-events-none absolute inset-0",
            yes && "bg-[radial-gradient(60%_60%_at_50%_0%,var(--bull),transparent_70%)] opacity-20",
            no && "bg-[radial-gradient(60%_60%_at_50%_0%,var(--bear),transparent_70%)] opacity-20",
          )}
        />
        <span className="relative text-[11px] font-medium tracking-[0.28em] text-muted-foreground uppercase">
          Take trade?
        </span>
        <div className="relative flex items-center gap-3">
          <Icon
            className={cn(
              "h-9 w-9",
              yes && "text-bull",
              no && "text-bear",
              !yes && !no && "text-muted-foreground",
            )}
          />
          <span
            className={cn(
              "font-display text-5xl font-extrabold tracking-tight",
              yes && "text-bull",
              no && "text-bear",
              !yes && !no && "text-muted-foreground",
            )}
          >
            {yes ? "YES" : no ? "NO" : "—"}
          </span>
        </div>
        <span className="relative text-xs font-medium text-muted-foreground/90">
          {yes ? "Take" : no ? "Skip" : "No data"}
        </span>
        <p className="relative mt-1 max-w-sm text-sm text-foreground/85">{verdict.headline}</p>
      </div>

      <div className="space-y-1.5 border-t border-glass-border p-4">
        <p className="mb-2 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Your history for this setup
        </p>
        {verdict.blockers.map((b) => (
          <div
            key={b}
            className="rounded-lg border border-bear/40 bg-bear/10 px-3 py-2 text-xs text-bear"
          >
            {b}
          </div>
        ))}
        {verdict.exact ? <Line line={verdict.exact} emphasized /> : null}
        {verdict.partials.length ? (
          verdict.partials.map((p) => <Line key={p.label} line={p} />)
        ) : verdict.exact ? null : (
          <p className="text-xs text-muted-foreground">
            No resolved trades match these factors yet. Save trades and this panel learns from them.
          </p>
        )}
      </div>
    </GlassCard>
  );
}
