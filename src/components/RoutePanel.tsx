import { ArrowLeftRight, ArrowUpDown, Route as RouteIcon, TriangleAlert, X } from "lucide-react";
import { connectionBetween, getPeak, LAYERS, peaks } from "@/data";
import { Button, Emblem, SectionTitle } from "@/components/ui";

interface Props {
  start: string;
  end: string;
  route: string[] | null;
  error: string;
  onChange: (start: string, end: string) => void;
  onFind: () => void;
  onClear: () => void;
  onFocus: (id: string) => void;
}

export default function RoutePanel({ start, end, route, error, onChange, onFind, onClear, onFocus }: Props) {
  const oneWays = route ? route.slice(1).filter((id, i) => connectionBetween(route[i], id)?.type === "one-way").length : 0;
  return (
    <div>
      <p className="text-xs leading-relaxed text-slate-400">
        Finds the fewest hops between two peaks, following the arrow directions — one-way scrambles can't be climbed back up.
      </p>

      <div className="mt-3 space-y-1.5">
        <PeakSelect label="Start" dot="bg-green-400" value={start} onChange={v => onChange(v, end)} />
        <div className="flex justify-center">
          <button onClick={() => onChange(end, start)} title="Swap start and end" aria-label="Swap start and end"
            className="rounded-full border border-white/10 bg-slate-950/50 p-1 text-slate-400 hover:text-slate-100"><ArrowUpDown size={13} /></button>
        </div>
        <PeakSelect label="End" dot="bg-pink-400" value={end} onChange={v => onChange(start, v)} />
      </div>

      <div className="mt-3 flex gap-2">
        <Button onClick={onFind} tone="primary" className="flex-1"><RouteIcon size={13} /> Show route</Button>
        {route && <Button onClick={onClear}><X size={13} /> Clear</Button>}
      </div>

      {error && (
        <p className="mt-3 flex gap-1.5 rounded-md border border-rose-400/30 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-200">
          <TriangleAlert size={13} className="mt-0.5 shrink-0" />{error}
        </p>
      )}

      {route && (
        <>
          <SectionTitle right={<span className="text-[11px] text-slate-500">{route.length - 1} hop{route.length === 2 ? "" : "s"}{oneWays ? ` · ${oneWays} one-way` : ""}</span>}>
            Route
          </SectionTitle>
          <ol className="relative ml-3 border-l border-violet-400/30">
            {route.map((id, i) => {
              const p = getPeak(id);
              const conn = i > 0 ? connectionBetween(route[i - 1], id) : undefined;
              const isStart = i === 0, isEnd = i === route.length - 1;
              return (
                <li key={id} className="relative pb-1 pl-5 last:pb-0">
                  <span className={`absolute -left-[9px] top-2.5 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-bold ${isStart ? "bg-green-400 text-stone-900" : isEnd ? "bg-pink-400 text-stone-900" : "bg-violet-600 text-white"}`}>
                    {isStart ? "S" : isEnd ? "E" : i}
                  </span>
                  <button onClick={() => onFocus(id)} className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-white/5">
                    <Emblem id={id} size={28} className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-100">{p.label}</span>
                      <span className="block truncate text-[11px] text-slate-500">
                        {conn && (conn.type === "both" ? <ArrowLeftRight size={10} className="mr-1 inline text-emerald-300" /> : <span className="mr-1 text-orange-300">→</span>)}
                        {conn?.route ? `“${conn.route}”` : <span style={{ color: LAYERS[p.layer].color }}>{LAYERS[p.layer].name}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-[11px] text-slate-500">The route glows violet on the map. Click a step to fly to it.</p>
        </>
      )}
    </div>
  );
}

function PeakSelect({ label, dot, value, onChange }: { label: string; dot: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2">
      <span className="flex w-12 shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-300"><span className={`h-2 w-2 rounded-full ${dot}`} />{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-white/10 bg-slate-950/60 px-2 py-1.5 text-sm text-slate-100 focus:border-amber-300/50 focus:outline-none">
        {LAYERS.map((l, i) => (
          <optgroup key={i} label={`${i === 0 ? "Home" : `Layer ${i}`} · ${l.name}`}>
            {peaks.filter(p => p.layer === i).map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
