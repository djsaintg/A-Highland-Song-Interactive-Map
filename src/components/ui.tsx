import { useId, useState, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { emblemFor, getPeak, LAYERS } from "@/data";
import { cn } from "@/utils/cn";

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-1.5 mt-5 flex items-center justify-between first:mt-1">
      <h3 className="font-display text-[13px] font-semibold uppercase tracking-wider text-amber-200/80">{children}</h3>
      {right}
    </div>
  );
}

export function BackButton({ onClick, label = "Back" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} className="mb-2 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100">
      <ChevronLeft size={14} /> {label}
    </button>
  );
}

export function Button({ children, onClick, disabled, title, tone = "default", className }: {
  children: ReactNode; onClick: () => void; disabled?: boolean; title?: string; tone?: "default" | "primary"; className?: string;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={cn("inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        tone === "primary"
          ? "border-amber-300/50 bg-amber-300/15 font-semibold text-amber-100 hover:bg-amber-300/25"
          : "border-white/10 bg-slate-950/50 text-slate-200 hover:bg-white/5",
        className)}>
      {children}
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange, className }: {
  value: T; options: { value: T; label: ReactNode; title?: string }[]; onChange: (v: T) => void; className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-md border border-white/10 bg-slate-950/50 p-0.5 text-xs", className)}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} title={o.title}
          className={cn("flex-1 rounded px-2 py-1 transition-colors", value === o.value ? "bg-amber-300/20 text-amber-100" : "text-slate-400 hover:text-slate-200")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * A peak's round journal-badge emblem, cropped out of the wiki's badge strip.
 * Renders as an <svg>, so it works both inside the map and in regular HTML.
 */
export function Emblem({ id, size, x, y, className }: { id: string; size: number; x?: number; y?: number; className?: string }) {
  const clip = useId();
  const [failed, setFailed] = useState(false);
  const e = emblemFor(id);
  const color = LAYERS[getPeak(id).layer].color;

  if (!e || failed) {
    return (
      <svg x={x} y={y} width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
        <circle cx="50" cy="50" r="46" fill="#ede3cc" stroke={color} strokeWidth="6" />
        <path d="M18 72 L42 36 L54 52 L64 40 L84 72 Z" fill={color} opacity="0.75" />
      </svg>
    );
  }
  // Wiki badge strips already have the orange ring; the two non-peak locations are plain pictures, so draw one.
  const ringed = e.r < 100;
  const r = ringed ? e.r * 0.97 : e.r;
  return (
    <svg x={x} y={y} width={size} height={size} viewBox={`${e.cx - r} ${e.cy - r} ${r * 2} ${r * 2}`} className={className} aria-hidden>
      <clipPath id={clip}><circle cx={e.cx} cy={e.cy} r={r} /></clipPath>
      <circle cx={e.cx} cy={e.cy} r={r} fill="#ede3cc" />
      <image href={e.url} width={e.w} height={e.h} clipPath={`url(#${clip})`} onError={() => setFailed(true)} />
      {!ringed && <circle cx={e.cx} cy={e.cy} r={r * 0.95} fill="none" stroke="#e8893a" strokeWidth={r * 0.1} />}
    </svg>
  );
}
