import { useCallback, useEffect, useRef, useState } from "react";
import { APP_VERSION, peakById, RENAMED_OFFERINGS } from "@/data";

export type NoteCategory = "item" | "map" | "path" | "cave" | "general";
export interface NoteEntry { category: NoteCategory; text: string }

export const NOTE_CATEGORIES: NoteCategory[] = ["item", "map", "path", "cave", "general"];

export const CATEGORY_CONFIG: Record<NoteCategory, { label: string; icon: string; className: string; placeholder: string }> = {
  item: { label: "Item", icon: "📦", className: "border-amber-400/40 bg-amber-400/10 text-amber-200", placeholder: "e.g. Golden Brooch by the hearth" },
  map: { label: "Map", icon: "🗺️", className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200", placeholder: "e.g. Map to the path below Woe's Wedding" },
  path: { label: "Path", icon: "🧭", className: "border-sky-400/40 bg-sky-400/10 text-sky-200", placeholder: "e.g. Scramble down to the stream → Fall Fell" },
  cave: { label: "Cave", icon: "🕳️", className: "border-stone-400/40 bg-stone-400/10 text-stone-200", placeholder: "e.g. Entrance behind the waterfall" },
  general: { label: "General", icon: "📝", className: "border-violet-400/40 bg-violet-400/10 text-violet-200", placeholder: "e.g. Ghost appears at night near the tree" },
};

type Notes = Record<string, NoteEntry[]>;
type Offerings = Record<string, string>;

const NOTES_KEY = "ahs-peak-notes-v1";
const OFFERINGS_KEY = "ahs-peak-blessings-v1";

/** Accepts both current `{category, text}` notes and the original plain-string notes. */
function normalizeEntry(x: unknown): NoteEntry | null {
  if (typeof x === "string") return x.trim() ? { category: "general", text: x.trim() } : null;
  if (x && typeof x === "object") {
    const o = x as { category?: unknown; text?: unknown };
    const text = String(o.text ?? "").trim();
    if (!text) return null;
    const category = NOTE_CATEGORIES.includes(o.category as NoteCategory) ? (o.category as NoteCategory) : "general";
    return { category, text };
  }
  return null;
}

function normalizeNotes(raw: unknown): Notes {
  const out: Notes = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [id, arr] of Object.entries(raw as Record<string, unknown>)) {
    if (!peakById.has(id) || !Array.isArray(arr)) continue;
    const entries = arr.map(normalizeEntry).filter((e): e is NoteEntry => !!e);
    if (entries.length) out[id] = entries;
  }
  return out;
}

/** Keeps only offerings that are valid for their peak (renamed items are carried over). */
function normalizeOfferings(raw: unknown): Offerings {
  const out: Offerings = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value !== "string") continue;
    const item = RENAMED_OFFERINGS[value] ?? value;
    if (peakById.get(id)?.blessings.includes(item)) out[id] = item;
  }
  return out;
}

function load<T>(key: string, normalize: (raw: unknown) => T): T {
  try {
    const raw = localStorage.getItem(key);
    return normalize(raw ? JSON.parse(raw) : null);
  } catch {
    return normalize(null);
  }
}

function usePersisted<T>(key: string, normalize: (raw: unknown) => T) {
  const [value, setValue] = useState(() => load(key, normalize));
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked: keep working in memory */ }
  }, [key, value]);
  return [value, setValue] as const;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function useJournal() {
  const [notes, setNotes] = usePersisted(NOTES_KEY, normalizeNotes);
  const [offerings, setOfferings] = usePersisted(OFFERINGS_KEY, normalizeOfferings);
  const [status, setStatus] = useState("");
  const statusTimer = useRef(0);

  const flash = useCallback((message: string) => {
    clearTimeout(statusTimer.current);
    setStatus(message);
    statusTimer.current = window.setTimeout(() => setStatus(""), 2400);
  }, []);

  const addNote = useCallback((id: string, entry: NoteEntry) => {
    setNotes(p => ({ ...p, [id]: [...(p[id] ?? []), entry] }));
  }, [setNotes]);

  const deleteNote = useCallback((id: string, index: number) => {
    setNotes(p => {
      const rest = (p[id] ?? []).filter((_, j) => j !== index);
      const next = { ...p };
      if (rest.length) next[id] = rest; else delete next[id];
      return next;
    });
  }, [setNotes]);

  /** Selecting another offering replaces the current one; selecting it again clears it. */
  const toggleOffering = useCallback((id: string, item: string) => {
    setOfferings(p => {
      const next = { ...p };
      if (next[id] === item) delete next[id]; else next[id] = item;
      return next;
    });
  }, [setOfferings]);

  const buildJSON = useCallback(() => JSON.stringify({
    app: "a-highland-song-peak-map",
    version: APP_VERSION,
    exported: new Date().toISOString(),
    notes,
    blessingSelections: offerings,
  }, null, 2), [notes, offerings]);

  const exportFile = useCallback(() => {
    const url = URL.createObjectURL(new Blob([buildJSON()], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "highland-song-notes.json";
    a.click();
    URL.revokeObjectURL(url);
    flash("Journal exported");
  }, [buildJSON, flash]);

  const copy = useCallback(() => {
    if (!navigator.clipboard) { flash("Clipboard not available here"); return; }
    navigator.clipboard.writeText(buildJSON()).then(() => flash("Copied to clipboard"), () => flash("Copy failed"));
  }, [buildJSON, flash]);

  /** Merges an exported journal into the current one: new notes are appended, offerings from the file win. */
  const importFile = useCallback((file: File) => {
    file.text().then(text => {
      const d = JSON.parse(text);
      if (!d || typeof d !== "object" || (!d.notes && !d.blessingSelections)) throw new Error("not a journal");
      const incomingNotes = normalizeNotes(d.notes);
      const incomingOfferings = normalizeOfferings(d.blessingSelections);

      let addedNotes = 0;
      const mergedNotes = { ...notes };
      for (const [id, entries] of Object.entries(incomingNotes)) {
        const merged = [...(mergedNotes[id] ?? [])];
        for (const e of entries) {
          if (merged.some(m => m.text === e.text && m.category === e.category)) continue;
          merged.push(e);
          addedNotes++;
        }
        mergedNotes[id] = merged;
      }
      const changedOfferings = Object.entries(incomingOfferings).filter(([id, item]) => offerings[id] !== item).length;

      setNotes(mergedNotes);
      setOfferings({ ...offerings, ...incomingOfferings });
      flash(`Imported ${plural(addedNotes, "note")} and ${plural(changedOfferings, "offering")}`);
    }).catch(() => flash("That file isn't a Highland Song journal"));
  }, [notes, offerings, setNotes, setOfferings, flash]);

  const noteTotal = Object.values(notes).reduce((n, a) => n + a.length, 0);
  const offeringTotal = Object.keys(offerings).length;

  return { notes, offerings, status, noteTotal, offeringTotal, addNote, deleteNote, toggleOffering, exportFile, copy, importFile };
}

export type Journal = ReturnType<typeof useJournal>;
