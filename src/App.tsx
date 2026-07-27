import { useState, useCallback, useEffect, useRef } from "react";
import { Download, Copy, Upload, Trash2, Plus, NotebookPen } from "lucide-react";

const W = "https://static.wikia.nocookie.net/a-highland-song/images";

interface Peak {
  id: string; label: string; gaelic: string;
  layer: number; col: number;
  blessings: string[]; blessingNote?: string; badge: string;
}
interface Connection { from: string; to: string; type: "one-way" | "both"; route?: string; lane?: number; }

const peaks: Peak[] = [
  { id: "edge-cottage", label: "Edge Cottage", gaelic: "An Taigh", layer: 0, col: 2, badge: W+"/e/e2/Hamish.png/revision/latest", blessings: [], blessingNote: "Starting location -- Moira's home. Not a blessable peak." },
  { id: "bald-edge", label: "The Bald Edge", gaelic: "Lann Maol", layer: 1, col: 1, badge: W+"/3/38/Bald_Edge_badge.png/revision/latest", blessings: ["Rusty Blade","Bottle Top","Sheep's Jawbone","Glass Fragment","Razor Blade","Tuna Can Lid","Metal Barb"], blessingNote: "Anything sharp enough to shave with" },
  { id: "giants-tooth", label: "The Giant's Tooth", gaelic: "Fiacail an Fhamhair", layer: 1, col: 3, badge: W+"/8/83/Standing_on_giant%27s_tooth.png/revision/latest", blessings: ["Sheep's Jawbone","Small Sharp Tooth","Cow's Tooth"] },
  { id: "little-guard", label: "Little Guard", gaelic: "Fear-faire Beag", layer: 2, col: 0, badge: W+"/7/77/Outer_Wall.png/revision/latest", blessings: ["Fisherman's Knife","Bronze Dagger","Spectacles","Eye Patch","Razor Blade","Glass Monocle","Broken Whistle","Glass Lens"] },
  { id: "outer-wall", label: "The Outer Wall", gaelic: "Balla a-Muigh", layer: 2, col: 1, badge: W+"/7/77/Outer_Wall.png/revision/latest", blessings: ["Playing Card","Thistle Flower","Crow's Feather"] },
  { id: "gulls-perch", label: "Gull's Perch", gaelic: "Spiris Faoileag", layer: 2, col: 2, badge: W+"/f/fd/Cave_gull%27s_perch.png/revision/latest", blessings: ["Any Feather","Winged Brass Pin"] },
  { id: "pillars", label: "The Pillars", gaelic: "Na Colbhan", layer: 2, col: 3, badge: W+"/c/c5/Fall_Fell.png/revision/latest", blessings: ["Any Feather","Winged Brass Pin"] },
  { id: "fall-fell", label: "Fall Fell", gaelic: "Tuiteam M\u00f2intich", layer: 2, col: 4, badge: W+"/c/c5/Fall_Fell.png/revision/latest", blessings: ["Top Half of Fishing Rod","Grass-Reed Boat","Seashell","Bottle Top"] },
  { id: "queens-throne", label: "The Queen's Throne", gaelic: "Cr\u00f9n na Banrigh", layer: 2, col: 5, badge: W+"/3/30/Queen%27s_Throne.png/revision/latest", blessings: ["Gold Wedding Band","Thistle Flower","Lavender Sprig","Yellow Broom"] },
  { id: "hopes-ladder", label: "Hope's Ladder", gaelic: "Dr\u00e9imire an D\u00f2chas", layer: 3, col: 0, badge: W+"/8/8e/Hope%27s_Ladder_path.png/revision/latest", blessings: ["Wooden Rung","Climbing Clip"] },
  { id: "lucks-out", label: "Luck's Out", gaelic: "Deireadh Fortan", layer: 3, col: 1, badge: W+"/0/00/Luck%27s_Out.png/revision/latest", blessings: ["Rabbit's Foot","Playing Card","Dice"] },
  { id: "golden-field", label: "Golden Field", gaelic: "Achadh \u00d2rail", layer: 3, col: 2, badge: W+"/8/83/Golden_Field.png/revision/latest", blessings: ["Any Gold Item","Barley Grains"], blessingNote: "Transforms offering into a golden flower -- peak stays blessed and flower can be reused" },
  { id: "stonesong", label: "Stonesong", gaelic: "\u00d2ran Cloiche", layer: 3, col: 3, badge: W+"/c/ce/Stonesong.png/revision/latest", blessings: ["Tiny Bell","Cowbell","Broken Whistle","Flute"] },
  { id: "woes-wedding", label: "Woe's Wedding", gaelic: "Banais Br\u00f2in", layer: 3, col: 4, badge: W+"/8/89/Woe%27s_Wedding.png/revision/latest", blessings: ["Wedding Band","Wild Rose","Yellow Broom","Lavender Sprig"] },
  { id: "little-finger", label: "Little Finger", gaelic: "Meur Beag", layer: 3, col: 5, badge: W+"/a/a7/Little_Finger.png/revision/latest", blessings: ["Leather Glove","Metal Nailfile"] },
  { id: "hogshead", label: "The Hogshead", gaelic: "Togsaid", layer: 3, col: 6, badge: W+"/4/43/Hogshead.png/revision/latest", blessings: ["Bottle of Whisky","Half-Full Hip Flask","Whisky Cask","Whisky Barrel"], blessingNote: "Using whisky also provides a map" },
  { id: "little-pail", label: "The Little Pail o' Milk", gaelic: "Quinag", layer: 4, col: 0, badge: W+"/a/ae/Little_Pail_o%27_Milk.png/revision/latest", blessings: ["Wooden Butter Knife","Cowbell","Leather Glove","Cow's Tooth"] },
  { id: "wrestling-rock", label: "The Wrestling Rock", gaelic: "Creag Carachd", layer: 4, col: 1, badge: W+"/7/74/Wrestling_Rock.png/revision/latest", blessings: ["Any object (special method)"], blessingNote: "Sit at the small rock to the left; choose positive responses to gloomy thoughts, then stand up" },
  { id: "lovers-leap", label: "The Lovers' Leap", gaelic: "Leum Leannain", layer: 4, col: 2, badge: W+"/7/70/Lovers_Leap.png/revision/latest", blessings: ["Thistle Flower","White Rose","Short Sword"] },
  { id: "warriors-walk", label: "The Warrior's Walk", gaelic: "Cuairt nan Gaisgeach", layer: 4, col: 3, badge: W+"/b/bb/Warriors_Walk.png/revision/latest", blessings: ["Carved Stone"], blessingNote: "Sleep in the ruined house and investigate the chimney to unlock the carved stone" },
  { id: "moonspike", label: "Moonspike", gaelic: "Stùc na Gealaich", layer: 4, col: 4, badge: W+"/5/54/Moonspike.png/revision/latest", blessings: ["Plastic Astronaut Figure","Crescent Moon Earring","Glass Lens"] },
  { id: "broken-promise", label: "The Broken Promise", gaelic: "Gealladh Briste", layer: 4, col: 5, badge: W+"/0/04/Broken_Promise.png/revision/latest", blessings: ["Any Gold Item"] },
  { id: "hobsons-mine", label: "Hobson's Mine", gaelic: "Mèinn Hobson", layer: 5, col: 0, badge: W+"/c/cb/HObson.png/revision/latest", blessings: ["Any Metal Item","Torch","Purple Crystal"] },
  { id: "devils-tail", label: "The Devil's Tail", gaelic: "Earball an Diabhail", layer: 5, col: 1, badge: W+"/4/47/Devil%27s_Tail.png/revision/latest", blessings: ["Bent Fork","Pickaxe","Chunk of Coal"] },
  { id: "forest-crown", label: "The Forest Crown", gaelic: "Crùn Coille", layer: 5, col: 2, badge: W+"/7/74/Forest_Crown.png/revision/latest", blessings: ["Pine Cone"] },
  { id: "beacon-hill", label: "Beacon Hill", gaelic: "Beinn Teine", layer: 5, col: 3, badge: W+"/b/b9/Beacon_Hill.png/revision/latest", blessings: ["Light the two beacons (no item left on peak)"], blessingNote: "Light the lower beacon with a fire source; fill the upper beacon with flammable items and light it" },
  { id: "watchers-eye", label: "Watcher's Eye", gaelic: "Sùil an Fhreiceadain", layer: 6, col: 0, badge: W+"/1/11/Watcher%27s_Eye.png/revision/latest", blessings: ["Glass Monocle","Spectacles","Eye Patch","Glass Lens"] },
  { id: "the-beak", label: "The Beak", gaelic: "An Gob", layer: 6, col: 1, badge: W+"/3/38/An_Gob.png/revision/latest", blessings: ["Lavender Sprig"], blessingNote: "The lavender sneezes you forward to the next area" },
  { id: "eagles-nest", label: "Eagle's Nest", gaelic: "Nead Iolaire", layer: 6, col: 2, badge: W+"/7/7e/Eagle%27s_Nest.png/revision/latest", blessings: ["Eagle Feather","Massive Quartz Rock"], blessingNote: "Eagles carry you on a trip; quartz rock reappears in future runs for another ride" },
  { id: "crofters-echo", label: "Crofter's Echo", gaelic: "Mac-talla Chroitear", layer: 6, col: 3, badge: W+"/b/b2/Crofter%27s_echo_panorama.png/revision/latest", blessings: ["Pocket Handkerchief","Pocket Mirror","Wooden Butter Knife","Boot Lace","Dice"] },
  { id: "broken-tooth", label: "The Broken Tooth", gaelic: "Fiacail Briste", layer: 7, col: 0, badge: W+"/c/c6/Broken_Tooth.png/revision/latest", blessings: ["Any Tooth","Hard-Boiled Sweet"] },
  { id: "witches-peak", label: "Witches' Peak", gaelic: "Stùc Buidsichean", layer: 7, col: 1, badge: W+"/8/83/Witches%27_Peak.png/revision/latest", blessings: ["Any Feather"] },
  { id: "sharpstone", label: "Sharpstone", gaelic: "Clach Gheur", layer: 7, col: 2, badge: W+"/8/8a/Sharpstone.png/revision/latest", blessings: ["Twisted Bit of Metal","Rusty Barb","Tent Peg","Glass Fragment","Any Knife or Blade"] },
  { id: "demons-wall", label: "The Demon's Wall", gaelic: "Balla Deamhain", layer: 8, col: 0, badge: W+"/0/0e/Demon%27s_Wall.png/revision/latest", blessings: ["Rabbit's Skull","Rabbit's Foot","Sheep's Jawbone","Bent Fork","Winged Brass Pin","Deer Antler","Small Sharp Tooth"] },
  { id: "lions-back", label: "The Lion's Back", gaelic: "Druim an Leòmhann", layer: 8, col: 1, badge: W+"/6/6c/Lion%27s_Back.png/revision/latest", blessings: ["Bronze Dagger","Roman Coin","White Rose","Golden Brooch","Thistle Flower"] },
  { id: "lightning-stone", label: "The Lightning Stone", gaelic: "Clach Dealanach", layer: 8, col: 2, badge: W+"/f/ff/Lightning_stone_railway.png/revision/latest", blessings: ["Any Metal Item","Torch","Purple Crystal"], blessingNote: "Do not bless during a thunderstorm -- lightning strikes cause damage!" },
  { id: "sea-wall", label: "The Sea Wall", gaelic: "Balla Mara", layer: 8, col: 3, badge: W+"/d/df/Sea_Wall.png/revision/latest", blessings: ["Grass-Reed Boat","Seashell","Chunk of Green Seaglass","Top Half of Fishing Rod"] },
  { id: "lighthouse", label: "The Lighthouse", gaelic: "Taigh Solais", layer: 9, col: 1, badge: W+"/5/5f/Highland_Song_logo.png/revision/latest", blessings: ["Moira's Torch"], blessingNote: "Must bless all other 35 peaks first" },
];

const connections: Connection[] = [
  { from: "edge-cottage", to: "bald-edge",    type: "one-way", route: "Cross to the higher ridge" },
  { from: "edge-cottage", to: "giants-tooth", type: "one-way", route: "Climb down the rocks" },
  { from: "bald-edge", to: "giants-tooth", type: "both", lane: -10 },
  { from: "bald-edge", to: "gulls-perch", type: "one-way" },
  { from: "giants-tooth", to: "pillars", type: "one-way" },
  { from: "giants-tooth", to: "fall-fell", type: "one-way" },
  { from: "little-guard", to: "outer-wall", type: "both", lane: -12 },
  { from: "outer-wall", to: "gulls-perch", type: "both", lane: 12 },
  { from: "gulls-perch", to: "little-guard", type: "one-way", lane: 12 },
  { from: "gulls-perch", to: "stonesong", type: "one-way" },
  { from: "gulls-perch", to: "golden-field", type: "one-way" },
  { from: "pillars", to: "fall-fell", type: "both", lane: -12 },
  { from: "pillars", to: "woes-wedding", type: "one-way", lane: 12 },
  { from: "fall-fell", to: "queens-throne", type: "one-way", lane: -12 },
  { from: "fall-fell", to: "woes-wedding", type: "one-way", lane: 12 },
  { from: "queens-throne", to: "warriors-walk", type: "one-way" },
  { from: "queens-throne", to: "hogshead", type: "both", lane: -12 },
  { from: "little-guard", to: "hopes-ladder", type: "one-way" },
  { from: "outer-wall", to: "hopes-ladder", type: "one-way" },
  { from: "gulls-perch", to: "hopes-ladder", type: "one-way" },
  { from: "hopes-ladder", to: "lucks-out", type: "both", lane: -12 },
  { from: "hopes-ladder", to: "golden-field", type: "one-way" },
  { from: "lucks-out", to: "golden-field", type: "both", lane: 12 },
  { from: "golden-field", to: "stonesong", type: "one-way" },
  { from: "stonesong", to: "woes-wedding", type: "one-way" },
  { from: "stonesong", to: "forest-crown", type: "one-way" },
  { from: "woes-wedding", to: "little-finger", type: "one-way" },
  { from: "little-finger", to: "warriors-walk", type: "one-way" },
  { from: "little-finger", to: "moonspike", type: "one-way" },
  { from: "hogshead", to: "moonspike", type: "one-way" },
  { from: "woes-wedding", to: "wrestling-rock", type: "one-way" },
  { from: "hopes-ladder", to: "little-pail", type: "one-way" },
  { from: "stonesong", to: "lovers-leap", type: "one-way" },
  { from: "little-pail", to: "wrestling-rock", type: "one-way" },
  { from: "wrestling-rock", to: "lovers-leap", type: "both", lane: -12 },
  { from: "wrestling-rock", to: "devils-tail", type: "one-way" },
  { from: "lovers-leap", to: "warriors-walk", type: "both", lane: 12 },
  { from: "lovers-leap", to: "forest-crown", type: "one-way" },
  { from: "warriors-walk", to: "forest-crown", type: "one-way" },
  { from: "moonspike", to: "broken-promise", type: "both", lane: -12 },
  { from: "moonspike", to: "beacon-hill", type: "one-way" },
  { from: "broken-promise", to: "hobsons-mine", type: "one-way" },
  { from: "hobsons-mine", to: "devils-tail", type: "both", lane: -12 },
  { from: "devils-tail", to: "forest-crown", type: "both", lane: 12 },
  { from: "forest-crown", to: "beacon-hill", type: "both", lane: -12 },
  { from: "forest-crown", to: "crofters-echo", type: "one-way" },
  { from: "beacon-hill", to: "crofters-echo", type: "one-way" },
  { from: "devils-tail", to: "watchers-eye", type: "one-way" },
  { from: "hobsons-mine", to: "watchers-eye", type: "one-way" },
  { from: "watchers-eye", to: "broken-tooth", type: "one-way" },
  { from: "watchers-eye", to: "witches-peak", type: "one-way" },
  { from: "watchers-eye", to: "sharpstone", type: "one-way" },
  { from: "the-beak", to: "witches-peak", type: "one-way" },
  { from: "the-beak", to: "eagles-nest", type: "one-way" },
  { from: "eagles-nest", to: "crofters-echo", type: "one-way" },
  { from: "crofters-echo", to: "eagles-nest", type: "one-way" },
  { from: "broken-tooth", to: "witches-peak", type: "both", lane: -12 },
  { from: "witches-peak", to: "sharpstone", type: "both", lane: 12 },
  { from: "broken-tooth", to: "demons-wall", type: "one-way" },
  { from: "witches-peak", to: "lions-back", type: "one-way" },
  { from: "sharpstone", to: "demons-wall", type: "one-way" },
  { from: "demons-wall", to: "lions-back", type: "both", lane: -12 },
  { from: "lions-back", to: "lightning-stone", type: "both", lane: 12 },
  { from: "lions-back", to: "sea-wall", type: "one-way" },
  { from: "lightning-stone", to: "sea-wall", type: "one-way" },
  { from: "eagles-nest", to: "sea-wall", type: "one-way" },
  { from: "sea-wall", to: "lighthouse", type: "one-way" },
];

const NODE_W=140, NODE_H=80, H_GAP=18, V_GAP=64, PAD_X=32, PAD_Y=32, TOTAL_LAYERS=10, BADGE_SIZE=36;
const layerCols: Record<number,number> = {};
peaks.forEach(p => { layerCols[p.layer] = Math.max(layerCols[p.layer]??0, p.col+1); });
const TOTAL_COLS = Math.max(...peaks.map(p => p.col)) + 1;
function cy(layer: number) { return PAD_Y + (TOTAL_LAYERS - 1 - layer) * (NODE_H + V_GAP) + NODE_H/2; }
function peakCx(p: Peak) {
  const c = layerCols[p.layer]??1;
  const tw = TOTAL_COLS*NODE_W + (TOTAL_COLS-1)*H_GAP;
  const lw = c*NODE_W + (c-1)*H_GAP;

  // Keep the single home node centered on the full map width.
  if (p.layer === 0) return PAD_X + tw / 2;
  
  // For layers 1 and 3, use centered layout (layer 1 has few peaks, layer 3 has the most)
  if (p.layer === 1 || p.layer === 3) {
    return PAD_X + (tw-lw)/2 + p.col*(NODE_W+H_GAP) + NODE_W/2;
  }
  
  // For other layers (2, 4, 5, 6, 7, 8, 9), spread peaks across the same width as layer 3
  // Layer 3 spans from column 0 to column 6, so total span = 6*(NODE_W+H_GAP)
  const maxColSpan = (TOTAL_COLS - 1) * (NODE_W + H_GAP);
  
  if (c === 1) {
    // Single peak: center it
    return PAD_X + tw/2;
  }
  
  // Multiple peaks: spread evenly across the max span
  const spacing = maxColSpan / (c - 1);
  return PAD_X + NODE_W/2 + p.col * spacing;
}
function peakCy(p: Peak) { return cy(p.layer); }
const SVG_W = PAD_X*2 + TOTAL_COLS*NODE_W + (TOTAL_COLS-1)*H_GAP;
const SVG_H = PAD_Y*2 + TOTAL_LAYERS*NODE_H + (TOTAL_LAYERS-1)*V_GAP + V_GAP/2;
function getPeak(id: string) { return peaks.find(p => p.id===id)!; }
function edgePoint(nx: number, ny: number, tx: number, ty: number): [number,number] {
  const dx=tx-nx, dy=ty-ny;
  if(!dx && !dy) return [nx,ny];
  const sx=dx?(NODE_W/2)/Math.abs(dx):Infinity, sy=dy?(NODE_H/2)/Math.abs(dy):Infinity;
  return [nx+dx*Math.min(sx,sy), ny+dy*Math.min(sx,sy)];
}
const lm: Record<number,{name:string;nBg:string;nBr:string;nT:string;bB:string}> = {
  0:{name:"Home",           nBg:"#fef9c3",nBr:"#f59e0b",nT:"#78350f",bB:"rgba(245,158,11,0.10)"},
  1:{name:"Entry Peaks",    nBg:"#d1fae5",nBr:"#34d399",nT:"#065f46",bB:"rgba(52,211,153,0.07)"},
  2:{name:"First Range",    nBg:"#dbeafe",nBr:"#60a5fa",nT:"#1e3a8a",bB:"rgba(96,165,250,0.07)"},
  3:{name:"Loch Hills",     nBg:"#e0f2fe",nBr:"#38bdf8",nT:"#0c4a6e",bB:"rgba(56,189,248,0.07)"},
  4:{name:"Valley & Dam",   nBg:"#ede9fe",nBr:"#a78bfa",nT:"#3b0764",bB:"rgba(167,139,250,0.07)"},
  5:{name:"Upper Hills",    nBg:"#fce7f3",nBr:"#f472b6",nT:"#831843",bB:"rgba(244,114,182,0.07)"},
  6:{name:"High Peaks",     nBg:"#fff7ed",nBr:"#fb923c",nT:"#7c2d12",bB:"rgba(251,146,60,0.07)"},
  7:{name:"Snow Peaks",     nBg:"#f0f9ff",nBr:"#7dd3fc",nT:"#0369a1",bB:"rgba(125,211,252,0.09)"},
  8:{name:"Coastal Range",  nBg:"#fef9c3",nBr:"#facc15",nT:"#713f12",bB:"rgba(250,204,21,0.07)"},
  9:{name:"The Lighthouse", nBg:"#fef3c7",nBr:"#f59e0b",nT:"#78350f",bB:"rgba(245,158,11,0.12)"},
};

function findPath(startId: string, endId: string): string[] | null {
  if (startId === endId) return [startId];
  const adj: Record<string, string[]> = {};
  peaks.forEach(p => { adj[p.id] = []; });
  connections.forEach(c => { adj[c.from].push(c.to); if (c.type === "both") adj[c.to].push(c.from); });
  const visited = new Set<string>();
  const queue: Array<{id: string; path: string[]}> = [{id: startId, path: [startId]}];
  visited.add(startId);
  while (queue.length > 0) {
    const {id, path} = queue.shift()!;
    for (const n of adj[id]) {
      if (visited.has(n)) continue;
      const np = [...path, n];
      if (n === endId) return np;
      visited.add(n);
      queue.push({id: n, path: np});
    }
  }
  return null;
}

const TIP_W = 380;

export default function App() {
  const [hovered, setHovered]   = useState<string|null>(null);
  const [selected, setSelected] = useState<string|null>(null);
  const [nodeRect, setNodeRect] = useState<DOMRect|null>(null);

  const [routeStart, setRouteStart] = useState("edge-cottage");
  const [routeEnd, setRouteEnd]     = useState("lighthouse");
  const [routePath, setRoutePath]   = useState<string[]|null>(null);
  const [routeError, setRouteError] = useState("");
  const [plannerOpen, setPlannerOpen] = useState(false);

  // ── Field Notes Categories & Types ─────────────────────────────────────────
type NoteCategory = "item" | "map" | "path" | "cave" | "general";

interface NoteEntry {
  category: NoteCategory;
  text: string;
}

const CATEGORY_CONFIG: Record<NoteCategory, { label: string; icon: string; bg: string; text: string; border: string; placeholder: string }> = {
  item: {
    label: "Item",
    icon: "📦",
    bg: "bg-amber-950/60",
    text: "text-amber-300",
    border: "border-amber-700/60",
    placeholder: "e.g. Golden Brooch, Rusty Blade, Sheep's Jawbone"
  },
  map: {
    label: "Map",
    icon: "🗺\uFE0F",
    bg: "bg-green-950/60",
    text: "text-green-300",
    border: "border-green-700/60",
    placeholder: "e.g. Map fragment #14, Shows path to Woe's Wedding"
  },
  path: {
    label: "Path",
    icon: "🧭",
    bg: "bg-sky-950/60",
    text: "text-sky-300",
    border: "border-sky-700/60",
    placeholder: "e.g. Scramble down to stream -> Fall Fell"
  },
  cave: {
    label: "Cave",
    icon: "🕳\uFE0F",
    bg: "bg-stone-950/60",
    text: "text-stone-300",
    border: "border-stone-600/60",
    placeholder: "e.g. Cave entrance behind waterfall, connects to Crofter's Echo"
  },
  general: {
    label: "General",
    icon: "📝",
    bg: "bg-purple-950/60",
    text: "text-purple-300",
    border: "border-purple-700/60",
    placeholder: "e.g. Ghost appears at night near the tree"
  }
};

function normalizeEntry(x: any): NoteEntry {
  if (typeof x === "string") return { category: "general", text: x };
  if (x && typeof x === "object") {
    const cat = (["item", "map", "path", "cave", "general"].includes(x.category) ? x.category : "general") as NoteCategory;
    return { category: cat, text: String(x.text || "") };
  }
  return { category: "general", text: "" };
}

  // Field Notes
  const [notes, setNotes] = useState<Record<string, NoteEntry[]>>(() => {
    try {
      const raw = localStorage.getItem("ahs-peak-notes-v1");
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      const normalized: Record<string, NoteEntry[]> = {};
      for (const [id, arr] of Object.entries(parsed)) {
        if (Array.isArray(arr)) {
          normalized[id] = arr.map(normalizeEntry).filter(e => e.text.trim() !== "");
        }
      }
      return normalized;
    } catch { return {}; }
  });
  const [blessingSelections, setBlessingSelections] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem("ahs-peak-blessings-v1");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [noteCategory, setNoteCategory] = useState<NoteCategory>("item");
  const [noteDraft, setNoteDraft] = useState("");
  const [noteStatus, setNoteStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { try { localStorage.setItem("ahs-peak-notes-v1", JSON.stringify(notes)); } catch {} }, [notes]);
  useEffect(() => { try { localStorage.setItem("ahs-peak-blessings-v1", JSON.stringify(blessingSelections)); } catch {} }, [blessingSelections]);

  const noteTotal = Object.values(notes).reduce((n, a) => n + a.length, 0);
  const noteCount = useCallback((id: string) => (notes[id]?.length ?? 0), [notes]);

  const flash = useCallback((m: string) => { setNoteStatus(m); setTimeout(() => setNoteStatus(""), 2200); }, []);
  const addNote = useCallback((id: string) => {
    const t = noteDraft.trim();
    if (!t) return;
    const entry: NoteEntry = { category: noteCategory, text: t };
    setNotes(p => ({...p, [id]: [...(p[id] ?? []), entry]}));
    setNoteDraft("");
    flash("Note saved");
  }, [noteDraft, noteCategory, flash]);

  const deleteNote = useCallback((id: string, i: number) => {
    setNotes(p => {
      const a = (p[id] ?? []).filter((_, j) => j !== i);
      const n = {...p};
      if (a.length) n[id] = a; else delete n[id];
      return n;
    });
  }, []);

  const toggleBlessing = useCallback((peakId: string, blessing: string) => {
    setBlessingSelections(previous => {
      const next = { ...previous };
      // Selecting another blessing replaces the current one; selecting it again clears it.
      if (next[peakId] === blessing) delete next[peakId];
      else next[peakId] = blessing;
      return next;
    });
  }, []);

  const buildJSON = useCallback(() => JSON.stringify({
    app: "a-highland-song-peak-map",
    version: "1.1.0",
    exported: new Date().toISOString(),
    notes,
    blessingSelections,
  }, null, 2), [notes, blessingSelections]);
  const exportNotes = useCallback(() => { const b = new Blob([buildJSON()], {type:"application/json"}); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href=u; a.download="highland-song-notes.json"; a.click(); URL.revokeObjectURL(u); flash("Notes exported"); }, [buildJSON, flash]);
  const copyNotes = useCallback(() => { navigator.clipboard?.writeText(buildJSON()).then(() => flash("Copied to clipboard")).catch(() => flash("Copy failed")); }, [buildJSON, flash]);
  const importNotes = useCallback((file: File) => {
    const r = new FileReader();
    r.onload = () => { try {
      const d = JSON.parse(String(r.result));
      const incomingNotes = d?.notes;
      const incomingBlessings = d?.blessingSelections;
      if ((!incomingNotes || typeof incomingNotes !== "object") && (!incomingBlessings || typeof incomingBlessings !== "object")) {
        flash("Invalid file");
        return;
      }

      let addedNotes = 0;
      let addedBlessings = 0;
      const mergedNotes = {...notes};
      if (incomingNotes && typeof incomingNotes === "object") {
        for (const [id, arr] of Object.entries(incomingNotes as Record<string, unknown>)) {
          if (!Array.isArray(arr)) continue;
          const merged = [...(mergedNotes[id] ?? [])];
          for (const rawItem of arr) {
            const normalized = normalizeEntry(rawItem);
            if (normalized.text.trim() && !merged.some(existing => existing.text === normalized.text && existing.category === normalized.category)) {
              merged.push(normalized);
              addedNotes++;
            }
          }
          if (merged.length) mergedNotes[id] = merged;
        }
      }

      const mergedBlessings = {...blessingSelections};
      if (incomingBlessings && typeof incomingBlessings === "object") {
        for (const [id, value] of Object.entries(incomingBlessings as Record<string, unknown>)) {
          const peak = peaks.find(p => p.id === id);
          if (peak && typeof value === "string" && peak.blessings.includes(value)) {
            if (mergedBlessings[id] !== value) addedBlessings++;
            mergedBlessings[id] = value;
          }
        }
      }

      setNotes(mergedNotes);
      setBlessingSelections(mergedBlessings);
      flash("Imported " + addedNotes + " note" + (addedNotes === 1 ? "" : "s") + " and " + addedBlessings + " blessing" + (addedBlessings === 1 ? "" : "s"));
    } catch { flash("Invalid file"); } };
    r.readAsText(file);
  }, [notes, blessingSelections, flash]);

  const active = selected ?? hovered;

  const updateRect = useCallback(() => {
    if (!active) { setNodeRect(null); return; }
    const el = document.getElementById("peak-node-" + active);
    if (el) setNodeRect(el.getBoundingClientRect());
  }, [active]);

  useEffect(() => {
    updateRect();
    if (!active) return;
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [active, updateRect]);

  const handleFindRoute = useCallback(() => { setRouteError(""); if (routeStart === routeEnd) { setRouteError("Start and end must be different peaks."); setRoutePath(null); return; } const p = findPath(routeStart, routeEnd); if (p) setRoutePath(p); else { setRoutePath(null); setRouteError("No valid route exists between these peaks (check arrow directions)."); } }, [routeStart, routeEnd]);
  const clearRoute = useCallback(() => { setRoutePath(null); setRouteError(""); }, []);
  const onPath = useCallback((id: string) => !!routePath && routePath.includes(id), [routePath]);
  const edgeOnPath = useCallback((from: string, to: string, type: string) => { if (!routePath) return false; for (let i = 0; i < routePath.length-1; i++) { const a = routePath[i], b = routePath[i+1]; if ((a===from && b===to) || (type==="both" && a===to && b===from)) return true; } return false; }, [routePath]);

  const iC = useCallback((f: string, t: string) => !active ? false : f===active || t===active, [active]);
  const iH = useCallback((id: string) => { if (!active) return false; if (id===active) return true; return connections.some(c => iC(c.from,c.to) && (c.from===id || c.to===id)); }, [active, iC]);

  const ap  = active ? getPeak(active) : null;
  const ow  = active ? connections.filter(c => c.from===active && c.type==="one-way") : [];
  const inc = active ? connections.filter(c => c.to===active   && c.type==="one-way") : [];
  const bi  = active ? connections.filter(c => c.type==="both" && (c.from===active||c.to===active)) : [];

  const GAP = 14;
  const MARGIN = 16;
  let tipLeft = 0;
  let tipTop = 0;

  if (nodeRect) {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const rightSpace = screenW - nodeRect.right - GAP;
    const leftSpace  = nodeRect.left - GAP;

    if (rightSpace >= TIP_W + MARGIN) {
      tipLeft = nodeRect.right + GAP;
    } else if (leftSpace >= TIP_W + MARGIN) {
      tipLeft = nodeRect.left - TIP_W - GAP;
    } else {
      tipLeft = Math.max(MARGIN, Math.min(nodeRect.left, screenW - TIP_W - MARGIN));
    }

    const TIP_H_ESTIMATED = 360;
    tipTop = nodeRect.top;
    if (tipTop + TIP_H_ESTIMATED > screenH - MARGIN) {
      tipTop = Math.max(MARGIN, screenH - TIP_H_ESTIMATED - MARGIN);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center py-8 px-2"
      style={{background:"radial-gradient(1100px 480px at 18% -8%,rgba(56,189,248,0.07),transparent 70%),radial-gradient(900px 420px at 88% -4%,rgba(245,158,11,0.06),transparent 70%),radial-gradient(1400px 700px at 50% 115%,rgba(52,211,153,0.05),transparent 70%),linear-gradient(180deg,#0f172a 0%,#0b1220 100%)"}}>

      <div className="mb-5 text-center">
        <h1 className="text-4xl font-bold text-white mb-1" style={{fontFamily:"'Fraunces', Georgia, serif",letterSpacing:"-0.01em"}}>&#x26F0;&#xFE0F; A Highland Song &mdash; Peak Travel Map</h1>
        <p className="text-slate-400 text-sm">Hover a peak for details &bull; Click to pin &bull; Click again to unpin</p>
      </div>

      <div className="flex gap-6 mb-5 flex-wrap justify-center">
        <div className="flex items-center gap-2 text-slate-300 text-xs">
          <svg width="52" height="16" viewBox="0 0 52 16"><defs><marker id="lo" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0, 7 3.5, 0 7" fill="#f97316"/></marker></defs><line x1="2" y1="8" x2="42" y2="8" stroke="#f97316" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#lo)"/></svg>One-way
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-xs">
          <svg width="52" height="16" viewBox="0 0 52 16"><defs><marker id="lbe" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0, 7 3.5, 0 7" fill="#34d399"/></marker><marker id="lbs" markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto-start-reverse"><polygon points="0 0, 7 3.5, 0 7" fill="#34d399"/></marker></defs><line x1="5" y1="8" x2="44" y2="8" stroke="#34d399" strokeWidth="2" markerStart="url(#lbs)" markerEnd="url(#lbe)"/></svg>Bidirectional
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-xs">
          <div className="w-7 h-7 rounded border border-slate-500 bg-slate-700 overflow-hidden"><img src={W+"/3/38/Bald_Edge_badge.png/revision/latest"} className="w-full h-full object-cover" alt="badge"/></div>Journal badge
        </div>
      </div>

      {/* Field Notes toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="flex items-center gap-1.5 text-amber-300 font-semibold" style={{fontFamily:"'Fraunces', Georgia, serif"}}><NotebookPen size={14} /> Field Notes: {noteTotal}</span>
        <button onClick={exportNotes} disabled={!noteTotal} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-600 bg-slate-800/80 text-slate-300 hover:border-amber-500 hover:text-amber-300 disabled:opacity-40 disabled:hover:border-slate-600 disabled:hover:text-slate-300 transition-colors"><Download size={12} /> Export</button>
        <button onClick={copyNotes} disabled={!noteTotal} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-600 bg-slate-800/80 text-slate-300 hover:border-amber-500 hover:text-amber-300 disabled:opacity-40 disabled:hover:border-slate-600 disabled:hover:text-slate-300 transition-colors"><Copy size={12} /> Copy</button>
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-600 bg-slate-800/80 text-slate-300 hover:border-emerald-500 hover:text-emerald-300 transition-colors"><Upload size={12} /> Import</button>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importNotes(f); e.target.value = ""; }} />
        {noteStatus && <span className="text-emerald-400 font-medium">{noteStatus}</span>}
      </div>

      {/* Route Planner */}
      <div className="mb-6 w-full max-w-3xl px-2">
        <button onClick={() => { setPlannerOpen(o => !o); if (plannerOpen) clearRoute(); }} className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 border border-slate-600 hover:border-violet-500 rounded-xl text-white font-semibold text-sm transition-colors">
          <span>&#x1F5FA;&#xFE0F; Route Planner</span>
          <span className="text-slate-400 text-xs font-normal">{routePath ? routePath.length-1+" hops found" : "Find the best path between two peaks"}<span className="ml-2 text-slate-500">{plannerOpen?"&#x25B2;":"&#x25BC;"}</span></span>
        </button>
        {plannerOpen && (
          <div className="mt-2 bg-slate-800/90 border border-slate-600 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-semibold text-green-400 mb-1">&#x1F7E2; Start</label>
                <select value={routeStart} onChange={e => { setRouteStart(e.target.value); clearRoute(); }} className="w-full bg-slate-700 border border-slate-500 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-green-400">{peaks.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select>
              </div>
              <div><label className="block text-xs font-semibold text-pink-400 mb-1">&#x1F534; End</label>
                <select value={routeEnd} onChange={e => { setRouteEnd(e.target.value); clearRoute(); }} className="w-full bg-slate-700 border border-slate-500 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-pink-400">{peaks.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleFindRoute} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm py-2 rounded-lg transition-colors">&#x2728; Find Route</button>
              {routePath && <button onClick={clearRoute} className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm py-2 rounded-lg transition-colors">Clear</button>}
            </div>
            {routeError && <p className="text-red-400 text-xs bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">&#x26A0;&#xFE0F; {routeError}</p>}
            {routePath && (
              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs font-semibold text-violet-300 mb-2">&#x1F4CD; Route: {routePath.length-1} hop{routePath.length!==2?"s":""} &bull; {routePath.length} peaks</p>
                <div className="flex flex-wrap items-center gap-1">
                  {routePath.map((id, idx) => { const p = getPeak(id); const isS = idx===0, isE = idx===routePath.length-1; return (
                    <div key={id} className="flex items-center gap-1">
                      <div className={"flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium "+(isS?"bg-green-900/40 border-green-600 text-green-300":isE?"bg-pink-900/40 border-pink-600 text-pink-300":"bg-violet-900/30 border-violet-700 text-violet-200")}>
                        <img src={p.badge} className="w-4 h-4 rounded object-cover shrink-0" alt=""/>{p.label}
                      </div>
                      {idx < routePath.length-1 && <span className="text-violet-500 text-xs">&#x279C;</span>}
                    </div>
                  ); })}
                </div>
                <p className="text-slate-500 text-xs mt-2">Violet arrows and glowing nodes show the route on the map below.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex gap-0 w-full max-w-fit">
        <div className="flex flex-col-reverse" style={{width:96,flexShrink:0}}>
          {Array.from({length:TOTAL_LAYERS},(_,i) => { const l=i; return (<div key={l} style={{height:NODE_H+V_GAP,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8}}><div className="text-right"><div className="text-slate-400 font-bold" style={{fontSize:10}}>{l===0?"Home":"Layer "+l}</div><div className="text-slate-500" style={{fontSize:9}}>{lm[l]?.name??""}</div></div></div>); })}
        </div>
        <div className="overflow-x-auto">
          <svg width={SVG_W} height={SVG_H} viewBox={"0 0 "+SVG_W+" "+SVG_H} style={{display:"block"}}>
            <defs>
              <marker id="ao" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#f97316"/></marker>
              <marker id="aoh" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#fdba74"/></marker>
              <marker id="abe" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#34d399"/></marker>
              <marker id="abs" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto"><polygon points="8 0, 0 4, 8 8" fill="#34d399"/></marker>
              <marker id="abeh" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#6ee7b7"/></marker>
              <marker id="absh" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto"><polygon points="8 0, 0 4, 8 8" fill="#6ee7b7"/></marker>
              <marker id="route-end" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><polygon points="0 0, 9 4.5, 0 9" fill="#a78bfa"/></marker>
              <marker id="route-start" markerWidth="9" markerHeight="9" refX="1" refY="4.5" orient="auto"><polygon points="9 0, 0 4.5, 9 9" fill="#a78bfa"/></marker>
            </defs>
            {Array.from({length:TOTAL_LAYERS},(_,i) => { const l=i, m=lm[l]; const topY=PAD_Y+(TOTAL_LAYERS-1-l)*(NODE_H+V_GAP)-V_GAP/2; const bH=l===0?NODE_H+V_GAP/2+PAD_Y:NODE_H+V_GAP; const y=l===0?topY+V_GAP/2:topY; return <rect key={l} x={0} y={y} width={SVG_W} height={bH} fill={m?.bB??""}/>; })}
            {connections.map((conn,i) => {
              const fp=getPeak(conn.from),tp=getPeak(conn.to),fcx=peakCx(fp),fcy=peakCy(fp),tcx=peakCx(tp),tcy=peakCy(tp);
              const [rawFx,rawFy]=edgePoint(fcx,fcy,tcx,tcy),[rawTx,rawTy]=edgePoint(tcx,tcy,fcx,fcy);
              const rawDx=rawTx-rawFx, rawDy=rawTy-rawFy;
              const rawLength=Math.hypot(rawDx,rawDy) || 1;
              const lane=conn.lane ?? 0;
              // Move parallel arrows onto separate visual lanes without changing graph data.
              const perpX=-rawDy/rawLength, perpY=rawDx/rawLength;
              const fx=rawFx+perpX*lane, fy=rawFy+perpY*lane;
              const tx=rawTx+perpX*lane, ty=rawTy+perpY*lane;
              const isOW=conn.type==="one-way", pe=edgeOnPath(conn.from,conn.to,conn.type), hl=iC(conn.from,conn.to);
              const dim=routePath?!pe:(active&&!hl);
              const st=dim?"rgba(255,255,255,0.04)":pe?"#a78bfa":isOW?(hl?"#fdba74":"#f97316"):(hl?"#6ee7b7":"#34d399");
              const mE=pe?"url(#route-end)":isOW?(hl?"url(#aoh)":"url(#ao)"):(hl?"url(#abeh)":"url(#abe)");
              const mS=pe?(isOW?undefined:"url(#route-start)"):isOW?undefined:(hl?"url(#absh)":"url(#abs)");
              const mx=(fx+tx)/2,my=(fy+ty)/2,ang=Math.atan2(ty-fy,tx-fx)*180/Math.PI,la=Math.abs(ang)>90?ang+180:ang;
              return (<g key={i}>{pe&&<line x1={fx} y1={fy} x2={tx} y2={ty} stroke="#7c3aed" strokeWidth="8" opacity="0.3" strokeLinecap="round"/>}<line x1={fx} y1={fy} x2={tx} y2={ty} stroke={st} strokeWidth={pe?3:hl?2.5:1.6} strokeDasharray={isOW&&!pe?"6,3":undefined} markerEnd={mE} markerStart={mS} opacity={dim?0.08:1} style={{transition:"all 0.18s"}}/>{conn.route&&!dim&&<text x={mx} y={my} textAnchor="middle" dominantBaseline="auto" fontSize="9" fontFamily="system-ui,sans-serif" fontStyle="italic" fill={pe?"#c4b5fd":hl?"#fde68a":"rgba(250,204,21,0.7)"} stroke="rgba(15,23,42,0.85)" strokeWidth="3" paintOrder="stroke" transform={"rotate("+la+","+mx+","+my+")"} dy="-4" style={{userSelect:"none"}}>{conn.route}</text>}</g>);
            })}
            {peaks.map(p => {
              const pcx=peakCx(p),pcy=peakCy(p),x=pcx-NODE_W/2,y=pcy-NODE_H/2,m=lm[p.layer],isHL=iH(p.id),isPinned=selected===p.id;
              const ip=onPath(p.id),ist=routePath?.[0]===p.id,ise=routePath?.[routePath.length-1]===p.id;
              const isDim=routePath?!ip:(active&&!isHL);
              const bx=x+6,by=pcy-BADGE_SIZE/2,tx2=bx+BADGE_SIZE+6,tw=NODE_W-BADGE_SIZE-18;
              const bc=ist?"#4ade80":ise?"#f472b6":ip?"#a78bfa":isPinned?"#fff":isHL?m?.nBr??"#666":isDim?"rgba(255,255,255,0.06)":m?.nBr??"#666";
              const bw=(ip||isPinned)?2.5:1.2;
              return (
                <g id={"peak-node-" + p.id} key={p.id} style={{cursor:"pointer"}}
                  onMouseEnter={(e)=>{if(!selected){setHovered(p.id);setNodeRect(e.currentTarget.getBoundingClientRect());}}}
                  onMouseLeave={()=>{if(!selected)setHovered(null);}}
                  onClick={(e)=>{
                    const target = e.currentTarget;
                    setSelected(s=>{
                      const next = s===p.id?null:p.id;
                      if (next) setNodeRect(target.getBoundingClientRect());
                      return next;
                    });
                  }}>
                  {ip&&<rect x={x-4} y={y-4} width={NODE_W+8} height={NODE_H+8} rx={13} fill="none" stroke={ist?"#4ade80":ise?"#f472b6":"#7c3aed"} strokeWidth="2" opacity="0.5"/>}
                  <rect x={x+3} y={y+4} width={NODE_W} height={NODE_H} rx={9} fill="rgba(0,0,0,0.4)" opacity={isDim?0.06:0.6}/>
                  <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={9} fill={isDim?"rgba(15,23,42,0.5)":ip?"rgba(109,40,217,0.15)":m?.nBg??"#333"} stroke={bc} strokeWidth={bw} opacity={isDim?0.25:1} style={{transition:"all 0.18s"}}/>
                  {ip&&routePath&&<circle cx={x+NODE_W-8} cy={y+8} r="9" fill={ist?"#4ade80":ise?"#f472b6":"#7c3aed"} opacity="0.95"/>}
                  {ip&&routePath&&<text x={x+NODE_W-8} y={y+8} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="700" fontFamily="system-ui,sans-serif" fill={ist||ise?"#1e1e2e":"#fff"} style={{userSelect:"none"}}>{ist?"S":ise?"E":routePath.indexOf(p.id)}</text>}
                  {isPinned&&!ip&&<text x={x+NODE_W-10} y={y+13} fontSize="11" textAnchor="middle" style={{userSelect:"none"}}>&#x1F4CC;</text>}
                  {noteCount(p.id)>0&&!isDim&&<><circle cx={x+9} cy={y+9} r="8" fill="#f59e0b" stroke="#78350f" strokeWidth="1"/><text x={x+9} y={y+9.5} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="700" fontFamily="system-ui,sans-serif" fill="#1e1e2e" style={{userSelect:"none"}}>{noteCount(p.id)}</text></>}
                  <g opacity={isDim?0.2:1}><g transform={"translate("+bx+","+by+")"}><clipPath id={"bc-"+p.id}><rect width={BADGE_SIZE} height={BADGE_SIZE} rx="5"/></clipPath><rect width={BADGE_SIZE} height={BADGE_SIZE} rx="5" fill="white" opacity="0.15"/><image href={p.badge} x={0} y={0} width={BADGE_SIZE} height={BADGE_SIZE} preserveAspectRatio="xMidYMid slice" clipPath={"url(#bc-"+p.id+")"}/><rect width={BADGE_SIZE} height={BADGE_SIZE} rx="5" fill="none" stroke={m?.nBr??"#666"} strokeWidth="1" opacity="0.5"/></g></g>
                  <foreignObject x={tx2} y={y+6} width={tw} height={NODE_H-12}><div style={{fontFamily:"system-ui,sans-serif",fontSize:p.label.length>14?"9px":"10.5px",fontWeight:700,color:isDim?"rgba(255,255,255,0.12)":ip?"#e9d5ff":m?.nT??"#333",lineHeight:1.2,marginBottom:3}}>{p.label}</div><div style={{fontFamily:"system-ui,sans-serif",fontSize:"8px",fontStyle:"italic",color:isDim?"rgba(255,255,255,0.06)":m?.nT??"#333",opacity:isDim?0.3:0.65,lineHeight:1.2}}>{p.gaelic}</div></foreignObject>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Floating tooltip — anchored to nodeRect */}
      {ap && (
        <div style={{position:"fixed",left:tipLeft,top:tipTop,width:TIP_W,zIndex:9999,pointerEvents:selected?"auto":"none"}}>
          <div className="bg-slate-800/95 backdrop-blur border border-slate-600 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-slate-600 bg-slate-700"><img src={ap.badge} alt={ap.label} className="w-full h-full object-cover"/></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-white font-bold text-base leading-tight">{ap.label}</h2>
                    <p className="text-slate-400 text-xs italic">{ap.gaelic}</p>
                    <p className="text-slate-500 text-xs mt-0.5">Layer {ap.layer} &mdash; {lm[ap.layer]?.name??""}{selected&&<span className="ml-2 text-amber-400 font-medium">&#x1F4CC; pinned</span>}</p>
                  </div>
                  {selected&&<button onClick={()=>setSelected(null)} className="text-slate-500 hover:text-white text-base leading-none transition-colors shrink-0 mt-0.5" title="Unpin">&#x2715;</button>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">&#127775; Blessings</p>
                <div className="flex flex-wrap gap-1">
                  {ap.blessings.length > 0 ? ap.blessings.map(blessing => {
                    const isLeft = blessingSelections[ap.id] === blessing;
                    return (
                      <button
                        key={blessing}
                        type="button"
                        disabled={!selected}
                        onClick={() => toggleBlessing(ap.id, blessing)}
                        title={selected ? (isLeft ? "Click to clear this offering" : "Mark this blessing as left here") : "Pin the peak to track its blessing"}
                        className={
                          "text-xs px-1.5 py-0.5 rounded-full border transition-colors " +
                          (isLeft
                            ? "bg-emerald-700/70 border-emerald-400 text-emerald-50 font-semibold"
                            : "bg-amber-900/40 border-amber-700/50 text-amber-200") +
                          (selected ? " cursor-pointer hover:border-emerald-400" : " cursor-default")
                        }
                      >
                        {isLeft && <span className="mr-1">&#x2713;</span>}
                        {blessing}
                      </button>
                    );
                  }) : <span className="text-slate-600 text-xs italic">Not blessable</span>}
                </div>
                {ap.blessings.length > 0 && (
                  <p className="text-slate-500 text-[10px] mt-1.5 italic">
                    {blessingSelections[ap.id]
                      ? "Green marks the offering currently left at this peak."
                      : selected ? "Select the offering left at this peak." : "Pin this peak to track its offering."}
                  </p>
                )}
                {ap.blessingNote&&<p className="text-slate-400 text-xs mt-1.5 italic leading-snug">&#8505; {ap.blessingNote}</p>}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">&#128506; Travel</p>
                <div className="space-y-1">
                  {bi.map(c=>{const o=c.from===active?c.to:c.from,op=getPeak(o);return <div key={o} className="flex items-center gap-1.5"><img src={op.badge} className="w-4 h-4 rounded object-cover shrink-0 border border-slate-600" alt=""/><span className="text-emerald-300 text-xs truncate">&#x21C4; {op.label}</span></div>;})}
                  {ow.map(c=>{const op=getPeak(c.to);return <div key={c.to} className="flex items-center gap-1.5"><img src={op.badge} className="w-4 h-4 rounded object-cover shrink-0 border border-slate-600" alt=""/><span className="text-orange-300 text-xs truncate">&#x279C; {op.label}{c.route&&<span className="text-amber-500 italic"> &ldquo;{c.route}&rdquo;</span>}</span></div>;})}
                  {inc.map(c=>{const op=getPeak(c.from);return <div key={c.from} className="flex items-center gap-1.5"><img src={op.badge} className="w-4 h-4 rounded object-cover shrink-0 border border-slate-600" alt=""/><span className="text-slate-500 text-xs truncate">&#x2190; {op.label}</span></div>;})}
                  {ow.length===0&&inc.length===0&&bi.length===0&&<p className="text-slate-600 text-xs italic">No connections</p>}
                </div>
              </div>
            </div>
            {/* Field notes */}
            <div className="mt-3 pt-3 border-t border-slate-700">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
                <NotebookPen size={12} /> Field Notes{noteCount(ap.id)>0&&<span className="normal-case font-normal text-slate-400"> ({noteCount(ap.id)})</span>}
              </p>
              {selected ? (
                <>
                  {/* Category Selector Pills */}
                  <div className="flex gap-1 mb-2">
                    {(["item", "map", "path", "cave", "general"] as NoteCategory[]).map(cat => {
                      const cfg = CATEGORY_CONFIG[cat];
                      const isSel = noteCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNoteCategory(cat)}
                          className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold py-1 rounded-md border transition-all ${
                            isSel
                              ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-1 ring-amber-400/40`
                              : "bg-slate-700/50 border-slate-600 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                          }`}
                        >
                          <span>{cfg.icon}</span>
                          <span>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Note Input */}
                  <div className="flex gap-1.5 mb-2">
                    <input
                      value={noteDraft}
                      onChange={e=>setNoteDraft(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter")addNote(ap.id);}}
                      placeholder={CATEGORY_CONFIG[noteCategory].placeholder}
                      className="flex-1 min-w-0 bg-slate-700 border border-slate-500 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
                    />
                    <button
                      onClick={()=>addNote(ap.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors shrink-0"
                    >
                      <Plus size={12}/> Add
                    </button>
                  </div>

                  {/* Notes List with Category Badges */}
                  {(notes[ap.id]??[]).length > 0 ? (
                    <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                      {(notes[ap.id]??[]).map((entry, i) => {
                        const cfg = CATEGORY_CONFIG[entry.category] ?? CATEGORY_CONFIG.general;
                        return (
                          <li key={i} className="flex items-start gap-1.5 bg-slate-700/60 border border-slate-600/80 rounded-lg p-1.5 text-xs">
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold border shrink-0 uppercase tracking-wider ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                              <span>{cfg.icon}</span>
                              <span>{cfg.label}</span>
                            </span>
                            <span className="text-slate-200 flex-1 leading-snug break-words pt-0.5">{entry.text}</span>
                            <button
                              onClick={()=>deleteNote(ap.id,i)}
                              className="text-slate-500 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                              title="Delete note"
                            >
                              <Trash2 size={12}/>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-slate-600 text-xs italic">No notes yet for this peak.</p>
                  )}
                </>
              ) : (
                <p className="text-slate-500 text-xs italic">
                  {(notes[ap.id]??[]).length > 0
                    ? noteCount(ap.id) + " recorded \u2014 click the peak to pin and edit"
                    : "Pin this peak to record what you find here"}
                </p>
              )}
            </div>
            {!selected&&<p className="text-slate-600 text-xs text-center mt-2 border-t border-slate-700 pt-2">Click to pin</p>}
          </div>
        </div>
      )}
    </div>
  );
}
