import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dropzone({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const readFile = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          readFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed transition-all duration-200",
          over
            ? "border-electric bg-electric/10"
            : "border-glass-border bg-glass hover:border-electric/50 hover:bg-electric/5",
        )}
      >
        {value ? (
          <>
            <img src={value} alt={`${label} preview`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute top-1.5 right-1.5 rounded-full bg-background/80 p-1 text-muted-foreground transition-colors hover:text-bear"
              aria-label={`Remove ${label}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-3 text-center">
            <ImagePlus className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-electric" />
            <span className="text-[11px] leading-tight text-muted-foreground">
              Click to upload or drag image
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => readFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}
