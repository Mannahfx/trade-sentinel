import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("glass-panel rounded-2xl", className)}>{children}</div>;
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="font-display text-sm font-semibold tracking-[0.18em] text-muted-foreground uppercase">
        {children}
      </h2>
      {hint ? <span className="text-xs text-muted-foreground/70">{hint}</span> : null}
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

const controlClass =
  "w-full rounded-xl border border-glass-border bg-surface-strong px-3 py-2.5 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-electric/40 focus:border-electric focus:ring-2 focus:ring-electric/25";

export function Select({
  className,
  options,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[] }) {
  return (
    <select className={cn(controlClass, "appearance-none pr-8", className)} {...props}>
      {options.map((o) => (
        <option key={o} value={o} className="bg-popover text-popover-foreground">
          {o}
        </option>
      ))}
    </select>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClass, "num", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, "min-h-[76px] resize-y", className)} {...props} />;
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5",
        active
          ? "border-bear/60 bg-bear/15 text-bear shadow-bear-glow"
          : "border-glass-border bg-glass text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  tone,
  children,
}: {
  tone: "bull" | "bear" | "neutral" | "muted";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        tone === "bull" && "border-bull/40 bg-bull/12 text-bull",
        tone === "bear" && "border-bear/40 bg-bear/12 text-bear",
        tone === "neutral" && "border-neutral-accent/40 bg-neutral-accent/12 text-neutral-accent",
        tone === "muted" && "border-glass-border bg-glass text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
