import { useState } from "react";
import { ArrowLeftRight, ArrowRight, CornerDownLeft, Flag, Info, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { getPeak, LAYERS, linksOf, peaks } from "@/data";
import { CATEGORY_CONFIG, NOTE_CATEGORIES, type Journal, type NoteCategory } from "@/store";
import { cn } from "@/utils/cn";
import { BackButton, Button, Emblem, SectionTitle } from "@/components/ui";

interface Props {
  journal: Journal;
  selectedId: string | null;
  onSelect: (id: string | null, fly?: boolean) => void;
  onRoute: (end: "start" | "end", id: string) => void;
}

export default function PeakPanel(props: Props) {
  return props.selectedId ? <PeakDetail {...props} id={props.selectedId} /> : <PeakList {...props} />;
}

function PeakList({ journal, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const match = (p: (typeof peaks)[number]) =>
    !q || p.label.toLowerCase().includes(q) || p.gaelic.toLowerCase().includes(q) || p.blessings.some(b => b.toLowerCase().includes(q));
  const results = peaks.filter(match);

  return (
    <div>
      <div className="relative">
        <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search peaks, Gaelic names or offerings…"
          className="w-full rounded-md border border-white/10 bg-slate-950/60 py-1.5 pl-8 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/50 focus:outline-none" />
      </div>
      {q && <p className="mt-1.5 text-[11px] text-slate-500">{results.length} match{results.length === 1 ? "" : "es"} — names, Gaelic and accepted offerings are searched.</p>}

      {LAYERS.map((layer, i) => {
        const rows = results.filter(p => p.layer === i);
        if (!rows.length) return null;
        return (
          <div key={i}>
            <SectionTitle right={<span className="text-[11px] text-slate-500">{i === 0 ? "Home" : `Layer ${i}`}</span>}>
              <span style={{ color: layer.color }}>{layer.name}</span>
            </SectionTitle>
            <div className="space-y-0.5">
              {rows.map(p => {
                const notes = journal.notes[p.id]?.length ?? 0;
                const hit = q && !p.label.toLowerCase().includes(q) && !p.gaelic.toLowerCase().includes(q) ? p.blessings.find(b => b.toLowerCase().includes(q)) : null;
                return (
                  <button key={p.id} onClick={() => onSelect(p.id, true)}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-white/5">
                    <Emblem id={p.id} size={32} className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-100">{p.label}</span>
                      <span className="block truncate font-hand text-[15px] leading-tight text-rose-300/80">{hit ? `accepts ${hit}` : p.gaelic}</span>
                    </span>
                    {journal.offerings[p.id] && <span title={`Offering left: ${journal.offerings[p.id]}`} className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">✓</span>}
                    {notes > 0 && <span title={`${notes} field notes`} className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-stone-900">{notes}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {!results.length && <p className="mt-6 text-center text-sm text-slate-500">No peaks match “{query}”.</p>}
    </div>
  );
}

function PeakDetail({ journal, id, onSelect, onRoute }: Props & { id: string }) {
  const p = getPeak(id);
  const layer = LAYERS[p.layer];
  const links = linksOf(id);
  const offering = journal.offerings[id];
  const notes = journal.notes[id] ?? [];
  const [category, setCategory] = useState<NoteCategory>("item");
  const [draft, setDraft] = useState("");

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    journal.addNote(id, { category, text });
    setDraft("");
  };

  return (
    <div>
      <BackButton onClick={() => onSelect(null)} label="All peaks" />
      <div className="flex items-center gap-3">
        <Emblem id={id} size={68} className="shrink-0 drop-shadow-lg" />
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold leading-tight text-amber-50">{p.label}</h2>
          <div className="font-hand text-xl leading-tight text-rose-300/90">{p.gaelic}</div>
          <div className="mt-0.5 text-xs text-slate-400">
            {p.layer === 0 ? "Home" : `Layer ${p.layer}`} · <span style={{ color: layer.color }}>{layer.name}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button onClick={() => onRoute("start", id)} className="flex-1" title="Plan a route starting here"><MapPin size={13} /> Route from here</Button>
        <Button onClick={() => onRoute("end", id)} className="flex-1" title="Plan a route ending here"><Flag size={13} /> Route to here</Button>
      </div>

      <SectionTitle>Blessing</SectionTitle>
      {p.blessings.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-1.5">
            {p.blessings.map(b => {
              const left = offering === b;
              return (
                <button key={b} onClick={() => journal.toggleOffering(id, b)}
                  title={left ? "Click to clear this offering" : "Mark this as the offering you left here"}
                  className={cn("rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                    left ? "border-emerald-400 bg-emerald-600/40 font-semibold text-emerald-50" : "border-amber-300/30 bg-amber-300/10 text-amber-100 hover:border-emerald-400/70")}>
                  {left && "✓ "}{b}
                </button>
              );
            })}
          </div>
          <p className="mt-1.5 text-[11px] text-slate-500">{offering ? "Green marks the offering you left at this peak — click it again to clear." : "Tap the offering you left here to track it."}</p>
        </>
      ) : <p className="text-xs italic text-slate-500">Not a blessable peak.</p>}
      {p.blessingNote && (
        <p className="mt-2 flex gap-1.5 rounded-md border border-sky-300/15 bg-sky-300/5 px-2.5 py-1.5 text-xs leading-relaxed text-slate-300">
          <Info size={13} className="mt-0.5 shrink-0 text-sky-300" />{p.blessingNote}
        </p>
      )}

      <SectionTitle>Travel</SectionTitle>
      <div className="space-y-0.5">
        {links.both.map(l => <TravelRow key={`b-${l.id}`} id={l.id} onSelect={onSelect} icon={<ArrowLeftRight size={13} className="text-emerald-300" />} hint="Two-way" />)}
        {links.out.map(l => <TravelRow key={`o-${l.id}`} id={l.id} onSelect={onSelect} icon={<ArrowRight size={13} className="text-orange-300" />} hint={l.conn.route ? `“${l.conn.route}”` : "One-way, leads there"} />)}
        {links.in.map(l => <TravelRow key={`i-${l.id}`} id={l.id} onSelect={onSelect} icon={<CornerDownLeft size={13} className="text-slate-500" />} hint="One-way, arrives from there" muted />)}
        {!links.both.length && !links.out.length && !links.in.length && <p className="text-xs italic text-slate-500">No known connections.</p>}
      </div>

      <SectionTitle right={notes.length > 0 && <span className="text-[11px] text-slate-500">{notes.length} recorded</span>}>Field notes</SectionTitle>
      <div className="grid grid-cols-5 gap-1">
        {NOTE_CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={cn("flex flex-col items-center rounded-md border py-1 text-[10px] font-semibold transition-colors",
              category === c ? CATEGORY_CONFIG[c].className : "border-white/10 bg-slate-950/40 text-slate-400 hover:text-slate-200")}>
            <span className="text-sm leading-none">{CATEGORY_CONFIG[c].icon}</span>{CATEGORY_CONFIG[c].label}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === "Enter") add(); }}
          placeholder={CATEGORY_CONFIG[category].placeholder}
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-slate-950/60 px-2.5 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-300/50 focus:outline-none" />
        <Button onClick={add} disabled={!draft.trim()} tone="primary"><Plus size={13} /> Add</Button>
      </div>
      {notes.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {notes.map((n, i) => (
            <li key={`${i}-${n.text}`} className="group flex items-start gap-2 rounded-md border border-white/5 bg-slate-950/40 px-2 py-1.5 text-sm">
              <span className={cn("mt-0.5 shrink-0 rounded border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide", CATEGORY_CONFIG[n.category].className)}>
                {CATEGORY_CONFIG[n.category].icon} {CATEGORY_CONFIG[n.category].label}
              </span>
              <span className="min-w-0 flex-1 break-words leading-snug text-slate-200">{n.text}</span>
              <button onClick={() => journal.deleteNote(id, i)} title="Delete note" aria-label="Delete note"
                className="mt-0.5 shrink-0 text-slate-500 transition-colors hover:text-rose-400 pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100">
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      ) : <p className="mt-2 text-xs italic text-slate-500">Nothing recorded yet — jot down items, maps, paths or caves you find here.</p>}
    </div>
  );
}

function TravelRow({ id, onSelect, icon, hint, muted }: { id: string; onSelect: Props["onSelect"]; icon: React.ReactNode; hint: string; muted?: boolean }) {
  const p = getPeak(id);
  return (
    <button onClick={() => onSelect(id, true)} className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-white/5">
      {icon}
      <Emblem id={id} size={24} className="shrink-0" />
      <span className={cn("min-w-0 flex-1 truncate text-sm", muted ? "text-slate-400" : "text-slate-100")}>{p.label}</span>
      <span className="shrink-0 text-[11px] text-slate-500">{hint}</span>
    </button>
  );
}
