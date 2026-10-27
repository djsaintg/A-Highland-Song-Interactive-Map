import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronsDown, ChevronsUp, Download, Mountain, NotebookPen, Route as RouteIcon } from "lucide-react";
import { APP_VERSION, BLESSABLE, findPath, peakById } from "@/data";
import { useJournal } from "@/store";
import { cn } from "@/utils/cn";
import PeakMap, { type MapFocus } from "@/components/PeakMap";
import PeakPanel from "@/components/PeakPanel";
import RoutePanel from "@/components/RoutePanel";
import JournalPanel from "@/components/JournalPanel";

type Tab = "peaks" | "route" | "journal";
const TABS: { id: Tab; label: string; icon: typeof Mountain }[] = [
  { id: "peaks", label: "Peaks", icon: Mountain },
  { id: "route", label: "Route Planner", icon: RouteIcon },
  { id: "journal", label: "Journal", icon: NotebookPen },
];

export default function App() {
  const journal = useJournal();
  const [tab, setTab] = useState<Tab>("peaks");
  const [selected, setSelected] = useState<string | null>(null);
  const [focus, setFocus] = useState<MapFocus>({ ids: [], key: 0 });
  const [routeEnds, setRouteEnds] = useState({ start: "edge-cottage", end: "lighthouse" });
  const [route, setRoute] = useState<string[] | null>(null);
  const [routeError, setRouteError] = useState("");
  const [bigMap, setBigMap] = useState(false); // phones: map/panel split
  const sideRef = useRef<HTMLDivElement>(null);
  const install = useInstallPrompt();

  const fly = (ids: string[]) => setFocus(f => ({ ids, key: f.key + 1 }));

  /** Select a peak and show its details. `flyTo` pans the map to it (for selections made outside the map). */
  const select = useCallback((id: string | null, flyTo = false) => {
    setSelected(id);
    if (!id) return;
    setTab("peaks");
    sideRef.current?.scrollTo({ top: 0 });
    if (flyTo) fly([id]);
  }, []);

  const showRoute = (start: string, end: string) => {
    setRouteEnds({ start, end });
    if (start === end) { setRoute(null); setRouteError("Pick two different peaks."); return; }
    const path = findPath(start, end);
    setRoute(path);
    setRouteError(path ? "" : "There's no way to get there from here — some arrows only go one way.");
    if (path) fly(path);
  };

  const clearRoute = () => { setRoute(null); setRouteError(""); };

  // Deep links: #peak/<id>, #route, #journal
  useEffect(() => {
    const fromHash = () => {
      const [kind, id] = decodeURIComponent(location.hash.slice(1)).split("/");
      if (kind === "peak" && peakById.has(id)) select(id, true);
      else if (TABS.some(t => t.id === kind)) setTab(kind as Tab);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [select]);
  useEffect(() => {
    const h = tab === "peaks" && selected ? `#peak/${selected}` : `#${tab}`;
    if (location.hash !== h) history.replaceState(null, "", h);
  }, [selected, tab]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)) setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex h-screen h-dvh flex-col bg-[#0d1519] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] text-slate-100">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-gradient-to-r from-[#14262b] via-[#1b2f2c] to-[#2c2438] px-3 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-4">
        <div className="flex items-baseline gap-2">
          <h1 className="font-display text-xl font-semibold tracking-wide text-amber-100">A Highland Song</h1>
          <span className="font-hand text-xl text-amber-200/70">Peak Travel Map</span>
        </div>
        {install && (
          <button onClick={install} title="Install the map as an app (works offline)"
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-amber-300/40 bg-amber-300/10 px-2.5 py-1 text-xs text-amber-100 hover:bg-amber-300/20">
            <Download size={14} /> Install
          </button>
        )}
        <button onClick={() => { setTab("journal"); setSelected(null); }} title="Open your journal"
          className={cn("inline-flex items-center gap-3 rounded-md border border-white/10 bg-slate-950/50 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/5", !install && "ml-auto")}>
          <span className="inline-flex items-center gap-1.5">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-600 text-[9px] font-bold text-white">✓</span>
            {journal.offeringTotal}/{BLESSABLE.length}<span className="hidden sm:inline"> blessed</span>
          </span>
          <span className="inline-flex items-center gap-1.5"><NotebookPen size={13} className="text-amber-300" />{journal.noteTotal}<span className="hidden sm:inline"> notes</span></span>
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <main className={cn("relative min-h-0 shrink-0 transition-[height] duration-200 md:h-auto md:flex-1 md:shrink", bigMap ? "h-[62dvh]" : "h-[45dvh]")}>
          <PeakMap journal={journal} selected={selected} route={route} focus={focus} onSelect={id => select(id)} />
        </main>
        <button onClick={() => setBigMap(b => !b)} className="flex items-center justify-center gap-1 border-t border-white/10 bg-[#111d22] py-1 text-[11px] text-slate-400 md:hidden"
          aria-label={bigMap ? "Shrink map" : "Enlarge map"}>
          {bigMap ? <ChevronsUp size={14} /> : <ChevronsDown size={14} />} {bigMap ? "Smaller map" : "Bigger map"}
        </button>
        <aside className="flex min-h-0 flex-1 flex-col bg-[#121e23] md:w-[370px] md:flex-none md:border-l md:border-white/10 lg:w-[420px]">
          <nav className="flex border-b border-white/10">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn("flex flex-1 flex-col items-center gap-0.5 border-b-2 py-2 text-[11px] transition-colors",
                  tab === t.id ? "border-amber-300 text-amber-100" : "border-transparent text-slate-400 hover:text-slate-200")}>
                <t.icon size={16} />{t.label}
              </button>
            ))}
          </nav>
          <div ref={sideRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            {tab === "peaks" && (
              <PeakPanel journal={journal} selectedId={selected} onSelect={select}
                onRoute={(which, id) => { setTab("route"); showRoute(which === "start" ? id : routeEnds.start, which === "end" ? id : routeEnds.end); }} />
            )}
            {tab === "route" && (
              <RoutePanel start={routeEnds.start} end={routeEnds.end} route={route} error={routeError}
                onChange={(start, end) => { setRouteEnds({ start, end }); clearRoute(); }}
                onFind={() => showRoute(routeEnds.start, routeEnds.end)} onClear={clearRoute}
                onFocus={id => { setSelected(id); fly([id]); }} />
            )}
            {tab === "journal" && <JournalPanel journal={journal} onSelect={select} />}
          </div>
          <footer className="flex items-center gap-1.5 border-t border-white/5 px-4 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 text-[10px] text-slate-500">
            <span className="truncate">Unofficial fan tool · data: A Highland Song Fandom Wiki (CC-BY-SA) · A Highland Song © inkle Ltd.</span>
            <span className="ml-auto shrink-0">v{APP_VERSION}</span>
          </footer>
        </aside>
      </div>
    </div>
  );
}

interface InstallEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

/** Chrome/Edge/Android "Add to home screen" prompt, captured so we can offer our own Install button. */
function useInstallPrompt() {
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as InstallEvent); };
    const onInstalled = () => setEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);
  if (!evt) return null;
  return () => { evt.prompt(); evt.userChoice.finally(() => setEvt(null)); };
}
