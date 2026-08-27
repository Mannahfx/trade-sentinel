import { Activity, CheckCircle2, Percent, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Trade } from "@/lib/trading/types";
import { formatR, stats } from "@/lib/trading/analysis";
import { GlassCard } from "./primitives";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <GlassCard className="group p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-electric/40">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            {label}
          </p>
          <p className="num mt-1.5 font-display text-3xl font-bold">{value}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-electric/12 text-electric transition-colors group-hover:bg-electric/20">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </GlassCard>
  );
}

export function StatCards({ trades }: { trades: Trade[] }) {
  const s = stats(trades);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Activity}
        label="Total trades"
        value={String(s.total)}
        sub={`${s.wins}W · ${s.losses}L logged`}
      />
      <StatCard
        icon={CheckCircle2}
        label="TAKE = YES"
        value={String(s.takeYes)}
        sub={s.total ? `${Math.round((s.takeYes / s.total) * 100)}% of entries` : "No entries yet"}
      />
      <StatCard
        icon={Percent}
        label="Win / loss ratio"
        value={s.losses ? (s.wins / s.losses).toFixed(2) : s.wins ? "∞" : "—"}
        sub={s.winRate === null ? "No resolved trades" : `${Math.round(s.winRate)}% win rate`}
      />
      <StatCard
        icon={TrendingUp}
        label="Net R"
        value={formatR(s.totalR)}
        sub={`avg ${formatR(s.avgR)} per trade`}
      />
    </div>
  );
}
