import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { Trade } from "@/lib/trading/types";
import { formatR } from "@/lib/trading/analysis";
import { Badge, GlassCard, SectionTitle } from "./primitives";
import { cn } from "@/lib/utils";

type SortKey = "datetime" | "instrument" | "direction" | "zoneQuality" | "resultR" | "outcome";

const COLUMNS: { key: SortKey | null; label: string; className?: string }[] = [
  { key: "datetime", label: "Date" },
  { key: "instrument", label: "Instrument" },
  { key: "direction", label: "Dir" },
  { key: null, label: "Setup" },
  { key: "zoneQuality", label: "Zone Q" },
  { key: null, label: "Planned R" },
  { key: "resultR", label: "Result" },
  { key: "outcome", label: "Outcome" },
  { key: null, label: "" },
];

export function TradesTable({
  trades,
  onDelete,
}: {
  trades: Trade[];
  onDelete: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("datetime");
  const [asc, setAsc] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...trades];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === "number" && typeof bv === "number") return asc ? av - bv : bv - av;
      return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [trades, sortKey, asc]);

  return (
    <GlassCard className="overflow-hidden p-5 sm:p-6">
      <SectionTitle hint={`${trades.length} saved`}>Recent trades ledger</SectionTitle>

      {trades.length === 0 ? (
        <p className="rounded-xl border border-dashed border-glass-border bg-glass/40 px-4 py-10 text-center text-sm text-muted-foreground">
          No trades saved yet. Log your first setup above — the Take Trade engine learns from it.
        </p>
      ) : (
        <div className="scroll-slim max-h-[26rem] overflow-auto rounded-xl border border-glass-border">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-surface-strong backdrop-blur-xl">
              <tr>
                {COLUMNS.map((col, i) => (
                  <th
                    key={`${col.label}-${i}`}
                    className="border-b border-glass-border px-3 py-2.5 text-left text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
                  >
                    {col.key ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (sortKey === col.key) setAsc(!asc);
                          else {
                            setSortKey(col.key!);
                            setAsc(false);
                          }
                        }}
                        className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                      >
                        {col.label}
                        {sortKey === col.key ? (
                          asc ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )
                        ) : null}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => (
                <tr
                  key={t.id}
                  className={cn(
                    "transition-colors hover:bg-electric/5",
                    i % 2 === 1 && "bg-glass/25",
                  )}
                >
                  <td className="num border-b border-glass-border px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                    {t.datetime.replace("T", " ")}
                  </td>
                  <td className="border-b border-glass-border px-3 py-2.5 whitespace-nowrap">
                    {t.instrument}
                  </td>
                  <td className="border-b border-glass-border px-3 py-2.5">
                    <Badge tone={t.direction === "BUY" ? "bull" : "bear"}>{t.direction}</Badge>
                  </td>
                  <td className="border-b border-glass-border px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                    {t.zoneType} · {t.entryTrigger} · {t.htfZoneTf}
                    {"\u2192"}
                    {t.entryTf}
                  </td>
                  <td className="border-b border-glass-border px-3 py-2.5">
                    <Badge tone="muted">
                      {t.zoneQuality}/{t.algoStructure}
                    </Badge>
                  </td>
                  <td className="num border-b border-glass-border px-3 py-2.5 text-muted-foreground">
                    {t.plannedR === null ? "—" : `${t.plannedR}R`}
                  </td>
                  <td
                    className={cn(
                      "num border-b border-glass-border px-3 py-2.5 font-semibold",
                      (t.resultR ?? 0) > 0 && "text-bull",
                      (t.resultR ?? 0) < 0 && "text-bear",
                    )}
                  >
                    {formatR(t.resultR)}
                  </td>
                  <td className="border-b border-glass-border px-3 py-2.5">
                    <Badge
                      tone={
                        t.outcome === "Win"
                          ? "bull"
                          : t.outcome === "Loss"
                            ? "bear"
                            : t.outcome === "BE"
                              ? "neutral"
                              : "muted"
                      }
                    >
                      {t.outcome}
                    </Badge>
                  </td>
                  <td className="border-b border-glass-border px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(t.id)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-bear/10 hover:text-bear"
                      aria-label="Delete trade"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
