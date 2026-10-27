import { useRef } from "react";
import { Copy, Download, Upload } from "lucide-react";
import { BLESSABLE, getPeak, peaks } from "@/data";
import { CATEGORY_CONFIG, NOTE_CATEGORIES, type Journal } from "@/store";
import { cn } from "@/utils/cn";
import { Button, Emblem, SectionTitle } from "@/components/ui";

export default function JournalPanel({ journal, onSelect }: { journal: Journal; onSelect: (id: string, fly?: boolean) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { notes, offerings, noteTotal, offeringTotal } = journal;
  const pct = Math.round((offeringTotal / BLESSABLE.length) * 100);
  const byCategory = NOTE_CATEGORIES.map(c => ({ c, n: Object.values(notes).flat().filter(e => e.category === c).length }));
  const annotated = peaks.filter(p => notes[p.id] || offerings[p.id]);
  const empty = !noteTotal && !offeringTotal;

  return (
    <div>
      <SectionTitle>Blessings</SectionTitle>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-slate-200"><b className="font-display text-2xl text-amber-100">{offeringTotal}</b> / {BLESSABLE.length} offerings left</span>
        <span className="text-xs text-slate-500">{pct}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-300 transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">Mark offerings from a peak's details. The Lighthouse can only be blessed once all 35 others are.</p>

      <SectionTitle right={<span className="text-[11px] text-slate-500">{noteTotal} total</span>}>Field notes</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        {byCategory.map(({ c, n }) => (
          <span key={c} className={cn("rounded-full border px-2 py-0.5 text-[11px]", n ? CATEGORY_CONFIG[c].className : "border-white/10 text-slate-500")}>
            {CATEGORY_CONFIG[c].icon} {CATEGORY_CONFIG[c].label} · {n}
          </span>
        ))}
      </div>

      <SectionTitle>Backup</SectionTitle>
      <div className="grid grid-cols-3 gap-1.5">
        <Button onClick={journal.exportFile} disabled={empty} title="Save notes and offerings as a JSON file"><Download size={13} /> Export</Button>
        <Button onClick={journal.copy} disabled={empty} title="Copy notes and offerings as JSON"><Copy size={13} /> Copy</Button>
        <Button onClick={() => fileRef.current?.click()} title="Merge a previously exported journal into this one"><Upload size={13} /> Import</Button>
      </div>
      <input ref={fileRef} type="file" accept=".json,application/json" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) journal.importFile(f); e.target.value = ""; }} />
      <p className={cn("mt-1.5 min-h-4 text-[11px] transition-colors", journal.status ? "text-emerald-300" : "text-slate-500")} role="status">
        {journal.status || "Your journal is saved in this browser. Export it to move it to another device."}
      </p>

      <SectionTitle>Your journal</SectionTitle>
      {annotated.length ? (
        <div className="space-y-2">
          {annotated.map(p => (
            <div key={p.id} className="rounded-lg border border-white/5 bg-slate-950/30 p-2">
              <button onClick={() => onSelect(p.id, true)} className="flex w-full items-center gap-2 text-left">
                <Emblem id={p.id} size={26} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-100 hover:text-amber-100">{getPeak(p.id).label}</span>
                {offerings[p.id] && <span className="shrink-0 truncate rounded-full bg-emerald-600/30 px-2 py-px text-[11px] text-emerald-200">✓ {offerings[p.id]}</span>}
              </button>
              {notes[p.id] && (
                <ul className="mt-1.5 space-y-1 pl-1">
                  {notes[p.id].map((n, i) => (
                    <li key={i} className="flex gap-1.5 text-xs leading-snug text-slate-300">
                      <span title={CATEGORY_CONFIG[n.category].label}>{CATEGORY_CONFIG[n.category].icon}</span>
                      <span className="min-w-0 break-words">{n.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : <p className="text-xs italic text-slate-500">Nothing yet. Open a peak to record offerings and field notes — they'll gather here.</p>}
    </div>
  );
}
