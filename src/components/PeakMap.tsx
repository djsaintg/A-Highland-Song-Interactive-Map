import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { connectionBetween, connections, getPeak, LAYERS, peaks, type Connection, type Peak } from "@/data";
import type { Journal } from "@/store";
import { Emblem } from "@/components/ui";

// ── Layout (map units) ────────────────────────────────────────────────────────
const NODE_W = 172, NODE_H = 62, H_GAP = 22, V_GAP = 80, PAD = 28, GUTTER = 128, EMBLEM = 48;
const TOTAL_LAYERS = LAYERS.length;
const TOTAL_COLS = Math.max(...peaks.map(p => p.col)) + 1;
const ROW_H = NODE_H + V_GAP;
const GRID_W = TOTAL_COLS * NODE_W + (TOTAL_COLS - 1) * H_GAP;
const MAP_W = GUTTER + PAD * 2 + GRID_W;
const MAP_H = PAD * 2 + TOTAL_LAYERS * NODE_H + (TOTAL_LAYERS - 1) * V_GAP;
const X0 = GUTTER + PAD;
const MIN_K = 0.8, MAX_K = 8;

const layerCols: Record<number, number> = {};
peaks.forEach(p => { layerCols[p.layer] = Math.max(layerCols[p.layer] ?? 0, p.col + 1); });

const rowCy = (layer: number) => PAD + (TOTAL_LAYERS - 1 - layer) * ROW_H + NODE_H / 2;

function peakCx(p: Peak) {
  const c = layerCols[p.layer];
  // Home and the busiest layers sit on the column grid; sparser layers spread across the full width.
  if (p.layer === 0 || c === 1) return X0 + GRID_W / 2;
  if (p.layer === 1 || p.layer === 3) {
    const lw = c * NODE_W + (c - 1) * H_GAP;
    return X0 + (GRID_W - lw) / 2 + p.col * (NODE_W + H_GAP) + NODE_W / 2;
  }
  return X0 + NODE_W / 2 + p.col * ((GRID_W - NODE_W) / (c - 1));
}

const pos = Object.fromEntries(peaks.map(p => [p.id, { x: peakCx(p), y: rowCy(p.layer) }]));

/** Where the line from a node's centre towards (tx, ty) leaves its card. */
function edgePoint(nx: number, ny: number, tx: number, ty: number, pad = 3): [number, number] {
  const dx = tx - nx, dy = ty - ny;
  if (!dx && !dy) return [nx, ny];
  const s = Math.min(dx ? (NODE_W / 2 + pad) / Math.abs(dx) : Infinity, dy ? (NODE_H / 2 + pad) / Math.abs(dy) : Infinity);
  return [nx + dx * s, ny + dy * s];
}

/** Each connection as a quadratic curve. Same-row links that skip over a peak arc above the row. */
const edgeGeometry = connections.map(conn => {
  const a = pos[conn.from], b = pos[conn.to];
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  let cx = mx + (-(b.y - a.y) / len) * (conn.lane ?? 0) * 2;
  let cy = my + ((b.x - a.x) / len) * (conn.lane ?? 0) * 2;
  const pa = getPeak(conn.from), pb = getPeak(conn.to);
  if (pa.layer === pb.layer && Math.abs(pa.col - pb.col) > 1) { cx = mx; cy = my - NODE_H * 1.6; }
  const [x0, y0] = edgePoint(a.x, a.y, cx, cy), [x2, y2] = edgePoint(b.x, b.y, cx, cy);
  const d = `M${x0},${y0} Q${cx},${cy} ${x2},${y2}`;
  // Curve midpoint (t = 0.5) and chord angle, for the named-route labels.
  const lx = 0.25 * x0 + 0.5 * cx + 0.25 * x2, ly = 0.25 * y0 + 0.5 * cy + 0.25 * y2;
  const ang = (Math.atan2(y2 - y0, x2 - x0) * 180) / Math.PI;
  return { conn, d, lx, ly, ang: Math.abs(ang) > 90 ? ang + 180 : ang };
});

const neighbours: Record<string, Set<string>> = Object.fromEntries(peaks.map(p => [p.id, new Set<string>()]));
connections.forEach(c => { neighbours[c.from].add(c.to); neighbours[c.to].add(c.from); });

// Caveat is a narrow hand: roughly 0.42em per character. Long names wrap to two lines; Gaelic is squeezed to fit.
const TEXT_X = EMBLEM + 14, TEXT_W = NODE_W - TEXT_X - 10;
const NAME_PX = 17, GAELIC_PX = 14.5;
const textWidth = (s: string, px: number) => s.length * px * 0.42;
function wrapName(label: string): string[] {
  if (textWidth(label, NAME_PX) <= TEXT_W) return [label];
  const words = label.split(" ");
  let first = "";
  while (words.length > 1 && textWidth(`${first} ${words[0]}`.trim(), NAME_PX) <= TEXT_W) first = `${first} ${words.shift()}`.trim();
  return first ? [first, words.join(" ")] : [label];
}
const nameLines = Object.fromEntries(peaks.map(p => [p.id, wrapName(p.label)]));
const fit = (s: string, px: number) => (textWidth(s, px) > TEXT_W ? { textLength: TEXT_W, lengthAdjust: "spacingAndGlyphs" as const } : {});

const COLORS = {
  oneWay: "#ef9f57", oneWayHi: "#fcd29b", both: "#5fcf9b", bothHi: "#a7f3d0", route: "#c4b5fd",
  start: "#4ade80", end: "#f472b6", selected: "#fde68a", paper: "#f3ead6", ink: "#2d2620", gaelic: "#b4412f",
};

export interface MapFocus { ids: string[]; key: number }

interface Props {
  journal: Journal;
  selected: string | null;
  route: string[] | null;
  focus: MapFocus;
  onSelect: (id: string | null) => void;
}

export default function PeakMap({ journal, selected, route, focus, onSelect }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ k: 1, tx: 0, ty: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const anim = useRef(0);

  const toMap = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint(); pt.x = clientX; pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  }, []);

  const animateTo = useCallback((target: { k: number; tx: number; ty: number }) => {
    cancelAnimationFrame(anim.current);
    const start = performance.now(), from = viewRef.current;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 420), e = 1 - Math.pow(1 - p, 3);
      setView({ k: from.k + (target.k - from.k) * e, tx: from.tx + (target.tx - from.tx) * e, ty: from.ty + (target.ty - from.ty) * e });
      if (p < 1) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  }, []);

  /** Zoom/pan so the given peaks are in view, without zooming out further than needed. */
  const frame = useCallback((ids: string[]) => {
    if (!ids.length) return;
    const xs = ids.map(id => pos[id].x), ys = ids.map(id => pos[id].y);
    const x0 = Math.min(...xs) - NODE_W, x1 = Math.max(...xs) + NODE_W, y0 = Math.min(...ys) - NODE_H * 1.5, y1 = Math.max(...ys) + NODE_H * 1.5;
    // The map is letterboxed into the pane, so work in what's actually visible: s = screen px per map unit at k = 1.
    const { clientWidth: cw, clientHeight: ch } = svgRef.current!;
    const s = Math.min(cw / MAP_W, ch / MAP_H);
    const fitK = Math.min(cw / s / (x1 - x0), ch / s / (y1 - y0));
    // Don't blow a lone peak up past ~1.1 screen px per map unit (a card about 190 px wide).
    const want = Math.min(fitK, (ids.length === 1 ? 1.1 : 1.3) / s);
    // Keep the current zoom if it's already closer than needed and everything still fits.
    const k = Math.max(1, Math.min(MAX_K, fitK, Math.max(viewRef.current.k, want)));
    animateTo({ k, tx: MAP_W / 2 - ((x0 + x1) / 2) * k, ty: MAP_H / 2 - ((y0 + y1) / 2) * k });
  }, [animateTo]);

  // Only re-frame when the app explicitly asks (key bump), not whenever the id list changes identity.
  useEffect(() => {
    if (focus.key) frame(focus.ids);
  }, [focus.key]);

  // Wheel zoom around the cursor (non-passive so the page doesn't scroll).
  useEffect(() => {
    const svg = svgRef.current!;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelAnimationFrame(anim.current);
      const m = toMap(e.clientX, e.clientY);
      setView(cur => {
        const k = Math.max(MIN_K, Math.min(MAX_K, cur.k * Math.exp(-e.deltaY * 0.0015)));
        return { k, tx: m.x - (m.x - cur.tx) * (k / cur.k), ty: m.y - (m.y - cur.ty) * (k / cur.k) };
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [toMap]);

  const zoomBy = (f: number) => {
    const k = Math.max(MIN_K, Math.min(MAX_K, view.k * f));
    animateTo({ k, tx: MAP_W / 2 - (MAP_W / 2 - view.tx) * (k / view.k), ty: MAP_H / 2 - (MAP_H / 2 - view.ty) * (k / view.k) });
  };

  // ── Pointer gestures: one pointer pans, two pinch-zoom, double-tap zooms in. ──
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ dist: number; wx: number; wy: number; k: number } | null>(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });

  const startPinch = () => {
    const [a, b] = [...pointers.current.values()];
    const m = toMap((a.x + b.x) / 2, (a.y + b.y) / 2), v = viewRef.current;
    pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, wx: (m.x - v.tx) / v.k, wy: (m.y - v.ty) / v.k, k: v.k };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cancelAnimationFrame(anim.current);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      drag.current = { x: e.clientX, y: e.clientY, tx: viewRef.current.tx, ty: viewRef.current.ty, moved: false };
      return;
    }
    const svg = e.currentTarget as Element;
    for (const id of pointers.current.keys()) if (!svg.hasPointerCapture(id)) svg.setPointerCapture(id);
    if (drag.current) drag.current.moved = true;
    startPinch();
    setHover(null);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pz = pinch.current;
    if (pz && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const m = toMap((a.x + b.x) / 2, (a.y + b.y) / 2);
      const k = Math.max(MIN_K, Math.min(MAX_K, (pz.k * Math.hypot(a.x - b.x, a.y - b.y)) / pz.dist));
      setView({ k, tx: m.x - pz.wx * k, ty: m.y - pz.wy * k });
      return;
    }
    const d = drag.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < (e.pointerType === "mouse" ? 4 : 8)) return;
    if (!d.moved) { d.moved = true; (e.currentTarget as Element).setPointerCapture(e.pointerId); }
    const a = toMap(d.x, d.y), b = toMap(e.clientX, e.clientY);
    setView(v => ({ ...v, tx: d.tx + (b.x - a.x), ty: d.ty + (b.y - a.y) }));
    setHover(null);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.delete(e.pointerId)) return;
    const left = [...pointers.current.values()];
    if (left.length >= 2) { startPinch(); return; }
    if (left.length === 1) {
      // Lifted one finger of a pinch: keep panning with the other.
      pinch.current = null;
      drag.current = { x: left[0].x, y: left[0].y, tx: viewRef.current.tx, ty: viewRef.current.ty, moved: true };
      return;
    }
    pinch.current = null;
    if (e.type === "pointerup" && e.pointerType !== "mouse" && drag.current && !drag.current.moved) {
      const now = performance.now(), lt = lastTap.current;
      if (now - lt.t < 320 && Math.hypot(e.clientX - lt.x, e.clientY - lt.y) < 30) {
        lastTap.current = { t: 0, x: 0, y: 0 };
        const m = toMap(e.clientX, e.clientY), cur = viewRef.current;
        const k = Math.min(MAX_K, cur.k * 2);
        animateTo({ k, tx: m.x - (m.x - cur.tx) * (k / cur.k), ty: m.y - (m.y - cur.ty) * (k / cur.k) });
      } else lastTap.current = { t: now, x: e.clientX, y: e.clientY };
    }
    // Clear after the click event that follows pointerup has had a chance to see `moved`.
    setTimeout(() => { drag.current = null; }, 0);
  };

  const showTip = (id: string) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || drag.current?.moved) return;
    const r = wrapRef.current!.getBoundingClientRect();
    setHover({ id, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  // ── Highlight state ────────────────────────────────────────────────────────
  const focusId = hover?.id ?? selected;
  const routeIndex = useMemo(() => new Map((route ?? []).map((id, i) => [id, i])), [route]);
  const routeEdges = useMemo(
    () => new Set((route ?? []).slice(1).map((id, i) => connectionBetween(route![i], id)).filter((c): c is Connection => !!c)),
    [route],
  );

  const nodeDim = (id: string) => (route ? !routeIndex.has(id) : !!focusId && id !== focusId && !neighbours[focusId].has(id));
  const edgeHot = (c: Connection) => !route && !!focusId && (c.from === focusId || c.to === focusId);
  const edgeDim = (c: Connection) => (route ? !routeEdges.has(c) : !!focusId && !edgeHot(c));

  const hoverPeak = hover ? getPeak(hover.id) : null;

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-[#0d1519]" onPointerLeave={() => setHover(null)}>
      <svg
        ref={svgRef} viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="h-full w-full touch-none select-none"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
        onClick={() => { if (!drag.current?.moved) onSelect(null); }}
        style={{ cursor: drag.current?.moved ? "grabbing" : "grab" }}
      >
        <defs>
          <radialGradient id="mist" cx="50%" cy="0%" r="90%">
            <stop offset="0%" stopColor="#1d3138" />
            <stop offset="55%" stopColor="#142227" />
            <stop offset="100%" stopColor="#0d1519" />
          </radialGradient>
          <pattern id="contours" width="180" height="60" patternUnits="userSpaceOnUse">
            <path d="M0 30 Q45 12 90 30 T180 30" fill="none" stroke="#cfe3d8" strokeOpacity="0.035" strokeWidth="1.2" />
            <path d="M0 52 Q45 36 90 52 T180 52" fill="none" stroke="#cfe3d8" strokeOpacity="0.025" strokeWidth="1" />
          </pattern>
          <filter id="card-shadow" x="-20%" y="-30%" width="140%" height="170%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.45" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
          {Object.entries({ ow: COLORS.oneWay, owh: COLORS.oneWayHi, bi: COLORS.both, bih: COLORS.bothHi, rt: COLORS.route }).map(([id, fill]) => (
            <marker key={id} id={`m-${id}`} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto-start-reverse">
              <path d="M0,1 L10,5 L0,9 z" fill={fill} />
            </marker>
          ))}
        </defs>

        <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`}>
          <rect x={-MAP_W} y={-MAP_H} width={MAP_W * 3} height={MAP_H * 3} fill="url(#mist)" />
          <rect x={-MAP_W} y={-MAP_H} width={MAP_W * 3} height={MAP_H * 3} fill="url(#contours)" />

          {/* Layer bands with their names in the left gutter */}
          {LAYERS.map((l, i) => {
            const top = rowCy(i) - ROW_H / 2;
            return (
              <g key={i} pointerEvents="none">
                <rect x={0} y={top} width={MAP_W} height={ROW_H} fill={l.color} opacity={i % 2 ? 0.035 : 0.06} />
                <line x1={0} x2={MAP_W} y1={top} y2={top} stroke={l.color} strokeOpacity={0.12} />
                <text x={PAD} y={rowCy(i) - 6} fontSize="10.5" fontWeight={600} letterSpacing="1.6" fill="#94a3b8" opacity={0.7}>{i === 0 ? "HOME" : `LAYER ${i}`}</text>
                <text x={PAD} y={rowCy(i) + 14} fontSize="15" className="font-display" fontWeight={600} fill={l.color} opacity={0.85}>{l.name}</text>
              </g>
            );
          })}

          {/* Connections */}
          {edgeGeometry.map(({ conn, d, lx, ly, ang }, i) => {
            const onRoute = routeEdges.has(conn), hot = edgeHot(conn), dim = edgeDim(conn);
            const isOW = conn.type === "one-way";
            const color = onRoute ? COLORS.route : isOW ? (hot ? COLORS.oneWayHi : COLORS.oneWay) : (hot ? COLORS.bothHi : COLORS.both);
            const marker = `url(#m-${onRoute ? "rt" : isOW ? (hot ? "owh" : "ow") : (hot ? "bih" : "bi")})`;
            return (
              <g key={i} opacity={dim ? 0.1 : 1} style={{ transition: "opacity 0.18s" }} pointerEvents="none">
                {onRoute && <path d={d} fill="none" stroke="#7c3aed" strokeWidth={10} opacity={0.35} filter="url(#glow)" />}
                <path d={d} fill="none" stroke={color} strokeWidth={onRoute ? 3.2 : hot ? 2.6 : 1.7}
                  strokeDasharray={isOW && !onRoute ? "7 5" : undefined} strokeLinecap="round"
                  markerEnd={marker} markerStart={isOW ? undefined : marker} />
                {conn.route && (
                  <text x={lx} y={ly} dy={-6} textAnchor="middle" fontSize="15" className="font-hand" fill={onRoute ? "#ddd6fe" : "#fde68a"}
                    stroke="#0d1519" strokeWidth={4} paintOrder="stroke" transform={`rotate(${ang},${lx},${ly})`}>{conn.route}</text>
                )}
              </g>
            );
          })}

          {/* Peaks */}
          {peaks.map(p => {
            const { x: px, y: py } = pos[p.id];
            const x = px - NODE_W / 2, y = py - NODE_H / 2;
            const layer = LAYERS[p.layer];
            const dim = nodeDim(p.id), isSel = selected === p.id, isFocus = focusId === p.id;
            const step = routeIndex.get(p.id);
            const onRoute = step !== undefined;
            const isStart = onRoute && step === 0, isEnd = onRoute && route && step === route.length - 1;
            const ringColor = isStart ? COLORS.start : isEnd ? COLORS.end : onRoute ? COLORS.route : isSel ? COLORS.selected : null;
            const lines = nameLines[p.id];
            const lh = 16, blockH = (lines.length + 1) * lh;
            const ty0 = NODE_H / 2 - blockH / 2 + lh * 0.78;
            const notes = journal.notes[p.id]?.length ?? 0;
            const offering = journal.offerings[p.id];
            return (
              <g key={p.id} transform={`translate(${x},${y})`} opacity={dim ? 0.28 : 1} style={{ transition: "opacity 0.18s", cursor: "pointer" }}
                onPointerEnter={showTip(p.id)} onPointerMove={showTip(p.id)} onPointerLeave={() => setHover(null)}
                onClick={e => { e.stopPropagation(); if (!drag.current?.moved) onSelect(isSel ? null : p.id); }}
                role="button" aria-label={p.label}>
                {ringColor && <rect x={-5} y={-5} width={NODE_W + 10} height={NODE_H + 10} rx={14} fill="none" stroke={ringColor} strokeWidth={2.5} opacity={0.9} />}
                <rect width={NODE_W} height={NODE_H} rx={10} fill={COLORS.paper} filter="url(#card-shadow)"
                  stroke={isFocus || isSel ? layer.color : `${layer.color}99`} strokeWidth={isFocus || isSel ? 2.4 : 1.4} />
                <rect x={0} y={NODE_H - 4} width={NODE_W} height={4} rx={2} fill={layer.color} opacity={0.55} />
                <Emblem id={p.id} size={EMBLEM} x={7} y={(NODE_H - EMBLEM) / 2} />
                {lines.map((l, i) => (
                  <text key={i} x={TEXT_X} y={ty0 + i * lh} fontSize={NAME_PX} fontWeight={700} className="font-hand" fill={COLORS.ink} {...fit(l, NAME_PX)}>{l}</text>
                ))}
                <text x={TEXT_X} y={ty0 + lines.length * lh} fontSize={GAELIC_PX} className="font-hand" fill={COLORS.gaelic} {...fit(p.gaelic, GAELIC_PX)}>{p.gaelic}</text>

                {offering && (
                  <g transform={`translate(${NODE_W - 4},4)`}>
                    <title>{`Offering left: ${offering}`}</title>
                    <circle r={10} fill="#16a34a" stroke={COLORS.paper} strokeWidth={2} />
                    <path d="M-4.5,0.5 L-1.2,3.8 L4.8,-3.6" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                )}
                {notes > 0 && (
                  <g transform={`translate(${NODE_W - 4},${NODE_H - 4})`}>
                    <title>{`${notes} field note${notes === 1 ? "" : "s"}`}</title>
                    <circle r={9} fill="#f59e0b" stroke={COLORS.paper} strokeWidth={2} />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight={700} fill="#1c1917">{notes}</text>
                  </g>
                )}
                {onRoute && (
                  <g transform="translate(4,4)">
                    <circle r={10} fill={isStart ? COLORS.start : isEnd ? COLORS.end : "#7c3aed"} stroke={COLORS.paper} strokeWidth={2} />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="10" fontWeight={700} fill={isStart || isEnd ? "#1c1917" : "#fff"}>
                      {isStart ? "S" : isEnd ? "E" : step}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-lg border border-white/10 bg-slate-900/80 shadow-lg backdrop-blur sm:bottom-4 sm:right-4">
        <button className="p-2.5 text-slate-200 hover:bg-white/10 pointer-fine:p-2" onClick={() => zoomBy(1.5)} title="Zoom in" aria-label="Zoom in"><Plus size={16} /></button>
        <button className="p-2.5 text-slate-200 hover:bg-white/10 pointer-fine:p-2" onClick={() => zoomBy(1 / 1.5)} title="Zoom out" aria-label="Zoom out"><Minus size={16} /></button>
        <button className="p-2.5 text-slate-200 hover:bg-white/10 pointer-fine:p-2" onClick={() => animateTo({ k: 1, tx: 0, ty: 0 })} title="Show the whole map" aria-label="Reset view"><LocateFixed size={16} /></button>
      </div>

      <Legend />

      {hoverPeak && hover && (
        <div className="pointer-events-none absolute z-20 w-64 rounded-lg border border-white/10 bg-slate-950/95 px-3 py-2 text-xs text-slate-100 shadow-xl"
          style={{ left: Math.max(8, Math.min(hover.x + 16, (wrapRef.current?.clientWidth ?? 0) - 264)), top: Math.min(hover.y + 16, (wrapRef.current?.clientHeight ?? 0) - 120) }}>
          <div className="font-display text-sm font-semibold" style={{ color: LAYERS[hoverPeak.layer].color }}>{hoverPeak.label}</div>
          <div className="font-hand text-[15px] leading-tight text-rose-300/90">{hoverPeak.gaelic}</div>
          <div className="mt-1 text-slate-400">{hoverPeak.layer === 0 ? "Home" : `Layer ${hoverPeak.layer}`} · {LAYERS[hoverPeak.layer].name}</div>
          {journal.offerings[hoverPeak.id]
            ? <div className="mt-1 text-emerald-300">✓ Offering left: {journal.offerings[hoverPeak.id]}</div>
            : hoverPeak.blessings.length > 0 && <div className="mt-1 text-amber-200/90">Bless with: {hoverPeak.blessings.slice(0, 4).join(", ")}{hoverPeak.blessings.length > 4 ? "…" : ""}</div>}
          {(journal.notes[hoverPeak.id]?.length ?? 0) > 0 && <div className="text-amber-300">{journal.notes[hoverPeak.id].length} field note{journal.notes[hoverPeak.id].length === 1 ? "" : "s"}</div>}
          <div className="mt-1 text-[11px] text-slate-500">Click for details</div>
        </div>
      )}
    </div>
  );
}

function Legend() {
  // Phones have little map to spare, so start the legend folded there.
  const [open, setOpen] = useState(() => matchMedia("(min-width: 768px)").matches);
  return (
    <div className="absolute bottom-3 left-3 max-w-[min(17rem,calc(100%-4.5rem))] rounded-lg border border-white/10 bg-slate-900/85 text-xs text-slate-200 shadow-lg backdrop-blur sm:bottom-4 sm:left-4">
      <button className="w-full px-3 py-2 text-left font-semibold hover:bg-white/5 pointer-fine:py-1.5" onClick={() => setOpen(o => !o)}>{open ? "▾" : "▸"} Legend</button>
      {open && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-3 pb-3">
          <LegendLine color={COLORS.oneWay} dashed label="One-way" />
          <LegendLine color={COLORS.both} both label="Two-way" />
          <LegendLine color={COLORS.route} label="Planned route" />
          <div className="flex items-center gap-1.5"><span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-600 text-[9px] font-bold text-white">✓</span>Offering left</div>
          <div className="flex items-center gap-1.5"><span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-stone-900">2</span>Field notes</div>
          <div className="col-span-2 mt-0.5 text-slate-400">Scroll or pinch to zoom · drag to pan</div>
        </div>
      )}
    </div>
  );
}

function LegendLine({ color, label, dashed, both }: { color: string; label: string; dashed?: boolean; both?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden>
        {both && <path d="M7,1 L1,5 L7,9 z" fill={color} />}
        <line x1={both ? 5 : 1} y1="5" x2="22" y2="5" stroke={color} strokeWidth="2" strokeDasharray={dashed ? "4 3" : undefined} />
        <path d="M21,1 L27,5 L21,9 z" fill={color} />
      </svg>
      {label}
    </div>
  );
}
