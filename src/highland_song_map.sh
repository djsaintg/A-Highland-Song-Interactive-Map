#!/usr/bin/env bash

# ─── A Highland Song — Peak Travel Map ───────────────────────────────────────
# "ld.so: libextest.so cannot be preloaded" messages are a harmless system
# quirk and can safely be ignored.
# ─────────────────────────────────────────────────────────────────────────────

set -e

PROJECT_DIR="$HOME/highland-song-map"
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

echo ""
echo "📁  Project directory: $PROJECT_DIR"
echo ""

# ── Load nvm ──────────────────────────────────────────────────────────────────
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  \. "$NVM_DIR/nvm.sh"
fi

# ── Install Node.js if missing ────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "⚠️   Node.js not found. Installing via nvm..."
  if command -v curl &>/dev/null; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  elif command -v wget &>/dev/null; then
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  else
    echo "❌  Neither curl nor wget found. Install Node.js from https://nodejs.org"
    exit 1
  fi
  \. "$NVM_DIR/nvm.sh"
  nvm install --lts
  nvm use --lts
fi

echo "✅  Node $(node --version)  /  npm $(npm --version)"
echo ""
echo "📝  Writing project files..."

mkdir -p src/utils

cat > package.json << 'EOF'
{
  "name": "highland-song-map",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" },
  "dependencies": { "clsx": "2.1.1", "react": "19.2.6", "react-dom": "19.2.6", "tailwind-merge": "3.4.0" },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.17", "@types/node": "22.19.17",
    "@types/react": "19.2.7", "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "5.1.1", "tailwindcss": "4.1.17",
    "typescript": "5.9.3", "vite": "7.3.2", "vite-plugin-singlefile": "2.3.0"
  }
}
EOF

cat > vite.config.ts << 'EOF'
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});
EOF

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020", "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext",
    "skipLibCheck": true, "moduleResolution": "bundler",
    "allowImportingTsExtensions": true, "isolatedModules": true,
    "moduleDetection": "force", "noEmit": true, "jsx": "react-jsx", "strict": true
  },
  "include": ["src"]
}
EOF

cat > index.html << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>A Highland Song — Peak Map</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > src/utils/cn.ts << 'EOF'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
EOF

cat > src/index.css << 'EOF'
@import "tailwindcss";
EOF

cat > src/main.tsx << 'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
createRoot(document.getElementById("root")!).render(
  <StrictMode><App /></StrictMode>
);
EOF

# App.tsx — no backticks anywhere, safe to embed in a quoted heredoc
cat > src/App.tsx << 'EOF'
import { useState, useCallback, useEffect } from "react";

const W = "https://static.wikia.nocookie.net/a-highland-song/images";

interface Peak {
  id: string; label: string; gaelic: string;
  layer: number; col: number;
  blessings: string[]; blessingNote?: string; badge: string;
}
interface Connection { from: string; to: string; type: "one-way" | "both"; route?: string; }

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
  { id: "moonspike", label: "Moonspike", gaelic: "St\u00f9c na Gealaich", layer: 4, col: 4, badge: W+"/5/54/Moonspike.png/revision/latest", blessings: ["Plastic Astronaut Figure","Crescent Moon Earring","Glass Lens"] },
  { id: "broken-promise", label: "The Broken Promise", gaelic: "Gealladh Briste", layer: 4, col: 5, badge: W+"/0/04/Broken_Promise.png/revision/latest", blessings: ["Any Gold Item"] },
  { id: "hobsons-mine", label: "Hobson's Mine", gaelic: "M\u00e8inn Hobson", layer: 5, col: 0, badge: W+"/c/cb/HObson.png/revision/latest", blessings: ["Any Metal Item","Torch","Purple Crystal"] },
  { id: "devils-tail", label: "The Devil's Tail", gaelic: "Earball an Diabhail", layer: 5, col: 1, badge: W+"/4/47/Devil%27s_Tail.png/revision/latest", blessings: ["Bent Fork","Pickaxe","Chunk of Coal"] },
  { id: "forest-crown", label: "The Forest Crown", gaelic: "Cr\u00f9n Coille", layer: 5, col: 2, badge: W+"/7/74/Forest_Crown.png/revision/latest", blessings: ["Pine Cone"] },
  { id: "beacon-hill", label: "Beacon Hill", gaelic: "Beinn Teine", layer: 5, col: 3, badge: W+"/b/b9/Beacon_Hill.png/revision/latest", blessings: ["Light the two beacons (no item left on peak)"], blessingNote: "Light the lower beacon with a fire source; fill the upper beacon with flammable items and light it" },
  { id: "watchers-eye", label: "Watcher's Eye", gaelic: "S\u00f9il an Fhreiceadain", layer: 6, col: 0, badge: W+"/1/11/Watcher%27s_Eye.png/revision/latest", blessings: ["Glass Monocle","Spectacles","Eye Patch","Glass Lens"] },
  { id: "the-beak", label: "The Beak", gaelic: "An Gob", layer: 6, col: 1, badge: W+"/3/38/An_Gob.png/revision/latest", blessings: ["Lavender Sprig"], blessingNote: "The lavender sneezes you forward to the next area" },
  { id: "eagles-nest", label: "Eagle's Nest", gaelic: "Nead Iolaire", layer: 6, col: 2, badge: W+"/7/7e/Eagle%27s_Nest.png/revision/latest", blessings: ["Eagle Feather","Massive Quartz Rock"], blessingNote: "Eagles carry you on a trip; quartz rock reappears in future runs for another ride" },
  { id: "crofters-echo", label: "Crofter's Echo", gaelic: "Mac-talla Chroitear", layer: 6, col: 3, badge: W+"/b/b2/Crofter%27s_echo_panorama.png/revision/latest", blessings: ["Pocket Handkerchief","Pocket Mirror","Wooden Butter Knife","Boot Lace","Dice"] },
  { id: "broken-tooth", label: "The Broken Tooth", gaelic: "Fiacail Briste", layer: 7, col: 0, badge: W+"/c/c6/Broken_Tooth.png/revision/latest", blessings: ["Any Tooth","Hard-Boiled Sweet"] },
  { id: "witches-peak", label: "Witches' Peak", gaelic: "St\u00f9c Buidsichean", layer: 7, col: 1, badge: W+"/8/83/Witches%27_Peak.png/revision/latest", blessings: ["Any Feather"] },
  { id: "sharpstone", label: "Sharpstone", gaelic: "Clach Gheur", layer: 7, col: 2, badge: W+"/8/8a/Sharpstone.png/revision/latest", blessings: ["Twisted Bit of Metal","Rusty Barb","Tent Peg","Glass Fragment","Any Knife or Blade"] },
  { id: "demons-wall", label: "The Demon's Wall", gaelic: "Balla Deamhain", layer: 8, col: 0, badge: W+"/0/0e/Demon%27s_Wall.png/revision/latest", blessings: ["Rabbit's Skull","Rabbit's Foot","Sheep's Jawbone","Bent Fork","Winged Brass Pin","Deer Antler","Small Sharp Tooth"] },
  { id: "lions-back", label: "The Lion's Back", gaelic: "Druim an Le\u00f2mhann", layer: 8, col: 1, badge: W+"/6/6c/Lion%27s_Back.png/revision/latest", blessings: ["Bronze Dagger","Roman Coin","White Rose","Golden Brooch","Thistle Flower"] },
  { id: "lightning-stone", label: "The Lightning Stone", gaelic: "Clach Dealanach", layer: 8, col: 2, badge: W+"/f/ff/Lightning_stone_railway.png/revision/latest", blessings: ["Any Metal Item","Torch","Purple Crystal"], blessingNote: "Do not bless during a thunderstorm -- lightning strikes cause damage!" },
  { id: "sea-wall", label: "The Sea Wall", gaelic: "Balla Mara", layer: 8, col: 3, badge: W+"/d/df/Sea_Wall.png/revision/latest", blessings: ["Grass-Reed Boat","Seashell","Chunk of Green Seaglass","Top Half of Fishing Rod"] },
  { id: "lighthouse", label: "The Lighthouse", gaelic: "Taigh Solais", layer: 9, col: 1, badge: W+"/5/5f/Highland_Song_logo.png/revision/latest", blessings: ["Moira's Torch"], blessingNote: "Must bless all other 35 peaks first" },
];

const connections: Connection[] = [
  { from: "edge-cottage", to: "bald-edge",    type: "one-way", route: "Cross to the higher ridge" },
  { from: "edge-cottage", to: "giants-tooth", type: "one-way", route: "Climb down the rocks" },
  { from: "bald-edge", to: "giants-tooth", type: "both" },
  { from: "bald-edge", to: "gulls-perch", type: "one-way" },
  { from: "giants-tooth", to: "pillars", type: "one-way" },
  { from: "giants-tooth", to: "fall-fell", type: "one-way" },
  { from: "little-guard", to: "outer-wall", type: "both" },
  { from: "outer-wall", to: "gulls-perch", type: "both" },
  { from: "gulls-perch", to: "little-guard", type: "one-way" },
  { from: "gulls-perch", to: "stonesong", type: "one-way" },
  { from: "gulls-perch", to: "golden-field", type: "one-way" },
  { from: "pillars", to: "fall-fell", type: "both" },
  { from: "pillars", to: "woes-wedding", type: "one-way" },
  { from: "fall-fell", to: "queens-throne", type: "one-way" },
  { from: "fall-fell", to: "woes-wedding", type: "one-way" },
  { from: "queens-throne", to: "warriors-walk", type: "one-way" },
  { from: "queens-throne", to: "hogshead", type: "both" },
  { from: "little-guard", to: "hopes-ladder", type: "one-way" },
  { from: "outer-wall", to: "hopes-ladder", type: "one-way" },
  { from: "gulls-perch", to: "hopes-ladder", type: "one-way" },
  { from: "hopes-ladder", to: "lucks-out", type: "both" },
  { from: "hopes-ladder", to: "golden-field", type: "one-way" },
  { from: "lucks-out", to: "golden-field", type: "both" },
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
  { from: "wrestling-rock", to: "lovers-leap", type: "both" },
  { from: "wrestling-rock", to: "devils-tail", type: "one-way" },
  { from: "lovers-leap", to: "warriors-walk", type: "both" },
  { from: "lovers-leap", to: "forest-crown", type: "one-way" },
  { from: "warriors-walk", to: "forest-crown", type: "one-way" },
  { from: "moonspike", to: "broken-promise", type: "both" },
  { from: "moonspike", to: "beacon-hill", type: "one-way" },
  { from: "broken-promise", to: "hobsons-mine", type: "one-way" },
  { from: "hobsons-mine", to: "devils-tail", type: "both" },
  { from: "devils-tail", to: "forest-crown", type: "both" },
  { from: "forest-crown", to: "beacon-hill", type: "both" },
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
  { from: "broken-tooth", to: "witches-peak", type: "both" },
  { from: "witches-peak", to: "sharpstone", type: "both" },
  { from: "broken-tooth", to: "demons-wall", type: "one-way" },
  { from: "witches-peak", to: "lions-back", type: "one-way" },
  { from: "sharpstone", to: "demons-wall", type: "one-way" },
  { from: "demons-wall", to: "lions-back", type: "both" },
  { from: "lions-back", to: "lightning-stone", type: "both" },
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
  return PAD_X + (tw-lw)/2 + p.col*(NODE_W+H_GAP) + NODE_W/2;
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

// ── Pathfinding (BFS -- respects arrow directionality) ────────────────────────
function findPath(startId: string, endId: string): string[] | null {
  if (startId === endId) return [startId];
  const adj: Record<string, string[]> = {};
  peaks.forEach(p => { adj[p.id] = []; });
  connections.forEach(c => {
    adj[c.from].push(c.to);
    if (c.type === "both") adj[c.to].push(c.from);
  });
  const visited = new Set<string>();
  const queue: Array<{id: string; path: string[]}> = [{id: startId, path: [startId]}];
  visited.add(startId);
  while (queue.length > 0) {
    const {id, path} = queue.shift()!;
    for (const neighbour of adj[id]) {
      if (visited.has(neighbour)) continue;
      const newPath = [...path, neighbour];
      if (neighbour === endId) return newPath;
      visited.add(neighbour);
      queue.push({id: neighbour, path: newPath});
    }
  }
  return null;
}

const TIP_W = 400;

export default function App() {
  const [hovered, setHovered] = useState<string|null>(null);
  const [selected, setSelected] = useState<string|null>(null);
  const [mouse, setMouse] = useState<{x:number; y:number}>({x:0, y:0});

  const [routeStart, setRouteStart] = useState<string>("edge-cottage");
  const [routeEnd, setRouteEnd]     = useState<string>("lighthouse");
  const [routePath, setRoutePath]   = useState<string[]|null>(null);
  const [routeError, setRouteError] = useState<string>("");
  const [plannerOpen, setPlannerOpen] = useState(false);

  const active = selected ?? hovered;

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({x: e.clientX, y: e.clientY});
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const handleFindRoute = useCallback(() => {
    setRouteError("");
    if (routeStart === routeEnd) { setRouteError("Start and end must be different peaks."); setRoutePath(null); return; }
    const path = findPath(routeStart, routeEnd);
    if (path) { setRoutePath(path); }
    else { setRoutePath(null); setRouteError("No valid route exists between these peaks (check arrow directions)."); }
  }, [routeStart, routeEnd]);

  const clearRoute = useCallback(() => { setRoutePath(null); setRouteError(""); }, []);

  const onPath = useCallback((id: string) => !!routePath && routePath.includes(id), [routePath]);
  const edgeOnPath = useCallback((from: string, to: string, type: string) => {
    if (!routePath) return false;
    for (let i = 0; i < routePath.length - 1; i++) {
      const a = routePath[i], b = routePath[i+1];
      if ((a===from && b===to) || (type==="both" && a===to && b===from)) return true;
    }
    return false;
  }, [routePath]);

  const iC = useCallback((f:string,t:string) => !active?false:f===active||t===active, [active]);
  const iH = useCallback((id:string) => {
    if(!active) return false;
    if(id===active) return true;
    return connections.some(c => iC(c.from,c.to) && (c.from===id||c.to===id));
  }, [active,iC]);

  const ap  = active ? getPeak(active) : null;
  const ow  = active ? connections.filter(c => c.from===active && c.type==="one-way") : [];
  const inc = active ? connections.filter(c => c.to===active   && c.type==="one-way") : [];
  const bi  = active ? connections.filter(c => c.type==="both" && (c.from===active||c.to===active)) : [];

  const OFFSET = 18;
  const tipLeft = mouse.x + OFFSET + TIP_W > window.innerWidth ? mouse.x - TIP_W - OFFSET : mouse.x + OFFSET;
  const TIP_H_APPROX = 260;
  const tipTop = mouse.y + OFFSET + TIP_H_APPROX > window.innerHeight ? mouse.y - TIP_H_APPROX - OFFSET : mouse.y + OFFSET;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-8 px-2">

      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-white mb-1">&#x26F0;&#xFE0F; A Highland Song &mdash; Peak Travel Map</h1>
        <p className="text-slate-400 text-sm">Hover a peak for details &bull; Click to pin &bull; Click again to unpin</p>
      </div>

      <div className="flex gap-6 mb-5 flex-wrap justify-center">
        <div className="flex items-center gap-2 text-slate-300 text-xs">
          <svg width="52" height="16" viewBox="0 0 52 16">
            <defs><marker id="lo" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0, 7 3.5, 0 7" fill="#f97316"/></marker></defs>
            <line x1="2" y1="8" x2="42" y2="8" stroke="#f97316" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#lo)"/>
          </svg>
          One-way
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-xs">
          <svg width="52" height="16" viewBox="0 0 52 16">
            <defs>
              <marker id="lbe" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><polygon points="0 0, 7 3.5, 0 7" fill="#34d399"/></marker>
              <marker id="lbs" markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto-start-reverse"><polygon points="0 0, 7 3.5, 0 7" fill="#34d399"/></marker>
            </defs>
            <line x1="5" y1="8" x2="44" y2="8" stroke="#34d399" strokeWidth="2" markerStart="url(#lbs)" markerEnd="url(#lbe)"/>
          </svg>
          Bidirectional
        </div>
        <div className="flex items-center gap-2 text-slate-300 text-xs">
          <div className="w-7 h-7 rounded border border-slate-500 bg-slate-700 overflow-hidden">
            <img src={W+"/3/38/Bald_Edge_badge.png/revision/latest"} className="w-full h-full object-cover" alt="badge"/>
          </div>
          Journal badge
        </div>
      </div>

      {/* Route Planner */}
      <div className="mb-6 w-full max-w-3xl px-2">
        <button
          onClick={() => { setPlannerOpen(o => !o); if(plannerOpen) clearRoute(); }}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 border border-slate-600 hover:border-violet-500 rounded-xl text-white font-semibold text-sm transition-colors"
        >
          <span>&#x1F5FA;&#xFE0F; Route Planner</span>
          <span className="text-slate-400 text-xs font-normal">
            {routePath ? routePath.length-1+" hops found" : "Find the best path between two peaks"}
            <span className="ml-2 text-slate-500">{plannerOpen?"&#x25B2;":"&#x25BC;"}</span>
          </span>
        </button>
        {plannerOpen && (
          <div className="mt-2 bg-slate-800/90 border border-slate-600 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-green-400 mb-1">&#x1F7E2; Start</label>
                <select value={routeStart} onChange={e => { setRouteStart(e.target.value); clearRoute(); }}
                  className="w-full bg-slate-700 border border-slate-500 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-green-400">
                  {peaks.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-pink-400 mb-1">&#x1F534; End</label>
                <select value={routeEnd} onChange={e => { setRouteEnd(e.target.value); clearRoute(); }}
                  className="w-full bg-slate-700 border border-slate-500 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-pink-400">
                  {peaks.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleFindRoute}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm py-2 rounded-lg transition-colors">
                &#x2728; Find Route
              </button>
              {routePath && (
                <button onClick={clearRoute}
                  className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm py-2 rounded-lg transition-colors">
                  Clear
                </button>
              )}
            </div>
            {routeError && (
              <p className="text-red-400 text-xs bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                &#x26A0;&#xFE0F; {routeError}
              </p>
            )}
            {routePath && (
              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs font-semibold text-violet-300 mb-2">
                  &#x1F4CD; Route: {routePath.length-1} hop{routePath.length!==2?"s":""} &bull; {routePath.length} peaks
                </p>
                <div className="flex flex-wrap items-center gap-1">
                  {routePath.map((id, idx) => {
                    const p = getPeak(id);
                    const isS = idx===0, isE = idx===routePath.length-1;
                    return (
                      <div key={id} className="flex items-center gap-1">
                        <div className={"flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium "+(isS?"bg-green-900/40 border-green-600 text-green-300":isE?"bg-pink-900/40 border-pink-600 text-pink-300":"bg-violet-900/30 border-violet-700 text-violet-200")}>
                          <img src={p.badge} className="w-4 h-4 rounded object-cover shrink-0" alt=""/>
                          {p.label}
                        </div>
                        {idx < routePath.length-1 && <span className="text-violet-500 text-xs">&#x279C;</span>}
                      </div>
                    );
                  })}
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
          {Array.from({length:TOTAL_LAYERS},(_,i) => {
            const l=i;
            return (
              <div key={l} style={{height:NODE_H+V_GAP,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:8}}>
                <div className="text-right">
                  <div className="text-slate-400 font-bold" style={{fontSize:10}}>{l===0?"Home":"Layer "+l}</div>
                  <div className="text-slate-500" style={{fontSize:9}}>{lm[l]?.name??""}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="overflow-x-auto">
          <svg width={SVG_W} height={SVG_H} viewBox={"0 0 "+SVG_W+" "+SVG_H} style={{display:"block"}}>
            <defs>
              <marker id="ao"   markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#f97316"/></marker>
              <marker id="aoh"  markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#fdba74"/></marker>
              <marker id="abe"  markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#34d399"/></marker>
              <marker id="abs"  markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto-start-reverse"><polygon points="0 0, 8 4, 0 8" fill="#34d399"/></marker>
              <marker id="abeh" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#6ee7b7"/></marker>
              <marker id="absh" markerWidth="8" markerHeight="8" refX="1" refY="4" orient="auto-start-reverse"><polygon points="0 0, 8 4, 0 8" fill="#6ee7b7"/></marker>
              <marker id="route-end"   markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><polygon points="0 0, 9 4.5, 0 9" fill="#a78bfa"/></marker>
              <marker id="route-start" markerWidth="9" markerHeight="9" refX="1" refY="4.5" orient="auto-start-reverse"><polygon points="0 0, 9 4.5, 0 9" fill="#a78bfa"/></marker>
            </defs>
            {Array.from({length:TOTAL_LAYERS},(_,i) => {
              const l=i, m=lm[l];
              const topY=PAD_Y+(TOTAL_LAYERS-1-l)*(NODE_H+V_GAP)-V_GAP/2;
              const bH=l===0?NODE_H+V_GAP/2+PAD_Y:NODE_H+V_GAP;
              const y=l===0?topY+V_GAP/2:topY;
              return <rect key={l} x={0} y={y} width={SVG_W} height={bH} fill={m?.bB??""}/>;
            })}
            {connections.map((conn,i) => {
              const fp=getPeak(conn.from), tp=getPeak(conn.to);
              const fcx=peakCx(fp), fcy=peakCy(fp), tcx=peakCx(tp), tcy=peakCy(tp);
              const [fx,fy]=edgePoint(fcx,fcy,tcx,tcy);
              const [tx,ty]=edgePoint(tcx,tcy,fcx,fcy);
              const isOW=conn.type==="one-way";
              const pathEdge = edgeOnPath(conn.from, conn.to, conn.type);
              const hl = iC(conn.from,conn.to);
              const dim = routePath ? !pathEdge : (active && !hl);
              const st = pathEdge ? "#a78bfa" : dim ? "rgba(255,255,255,0.04)" : isOW?(hl?"#fdba74":"#f97316"):(hl?"#6ee7b7":"#34d399");
              const mE = pathEdge ? "url(#route-end)" : isOW?(hl?"url(#aoh)":"url(#ao)"):(hl?"url(#abeh)":"url(#abe)");
              const mS = pathEdge ? (isOW?undefined:"url(#route-start)") : isOW?undefined:(hl?"url(#absh)":"url(#abs)");
              const midX=(fx+tx)/2, midY=(fy+ty)/2;
              const angle=Math.atan2(ty-fy,tx-fx)*180/Math.PI;
              const labelAngle=Math.abs(angle)>90?angle+180:angle;
              return (
                <g key={i}>
                  {pathEdge && <line x1={fx} y1={fy} x2={tx} y2={ty} stroke="#7c3aed" strokeWidth="8" opacity="0.3" strokeLinecap="round"/>}
                  <line x1={fx} y1={fy} x2={tx} y2={ty} stroke={st}
                    strokeWidth={pathEdge?3:hl?2.5:1.6}
                    strokeDasharray={isOW&&!pathEdge?"6,3":undefined}
                    markerEnd={mE} markerStart={mS}
                    opacity={dim?0.08:1} style={{transition:"all 0.18s"}}/>
                  {conn.route && !dim && (
                    <text x={midX} y={midY} textAnchor="middle" dominantBaseline="auto"
                      fontSize="9" fontFamily="system-ui,sans-serif" fontStyle="italic"
                      fill={pathEdge?"#c4b5fd":hl?"#fde68a":"rgba(250,204,21,0.7)"}
                      stroke="rgba(15,23,42,0.85)" strokeWidth="3" paintOrder="stroke"
                      transform={"rotate("+labelAngle+","+midX+","+midY+")"}
                      dy="-4" style={{userSelect:"none"}}>{conn.route}</text>
                  )}
                </g>
              );
            })}
            {peaks.map(p => {
              const pcx=peakCx(p), pcy=peakCy(p), x=pcx-NODE_W/2, y=pcy-NODE_H/2;
              const m=lm[p.layer], isHL=iH(p.id), isPinned=selected===p.id;
              const isOnPath=onPath(p.id);
              const isPathStart=routePath?.[0]===p.id;
              const isPathEnd=routePath?.[routePath.length-1]===p.id;
              const isDim=routePath?!isOnPath:(active&&!isHL);
              const bx=x+6, by=pcy-BADGE_SIZE/2, tx2=bx+BADGE_SIZE+6, tw=NODE_W-BADGE_SIZE-18;
              const borderCol=isPathStart?"#4ade80":isPathEnd?"#f472b6":isOnPath?"#a78bfa":isPinned?"#fff":isHL?m?.nBr??"#666":isDim?"rgba(255,255,255,0.06)":m?.nBr??"#666";
              const borderW=(isOnPath||isPinned)?2.5:1.2;
              return (
                <g key={p.id} style={{cursor:"pointer"}}
                  onMouseEnter={() => { if(!selected) setHovered(p.id); }}
                  onMouseLeave={() => { if(!selected) setHovered(null); }}
                  onClick={() => setSelected(s => s===p.id?null:p.id)}>
                  {isOnPath && (
                    <rect x={x-4} y={y-4} width={NODE_W+8} height={NODE_H+8} rx={13}
                      fill="none" stroke={isPathStart?"#4ade80":isPathEnd?"#f472b6":"#7c3aed"} strokeWidth="2" opacity="0.5"/>
                  )}
                  <rect x={x+3} y={y+4} width={NODE_W} height={NODE_H} rx={9} fill="rgba(0,0,0,0.4)" opacity={isDim?0.06:0.6}/>
                  <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={9}
                    fill={isDim?"rgba(15,23,42,0.5)":isOnPath?"rgba(109,40,217,0.15)":m?.nBg??"#333"}
                    stroke={borderCol} strokeWidth={borderW} opacity={isDim?0.25:1}
                    style={{transition:"all 0.18s"}}/>
                  {isOnPath && routePath && (
                    <circle cx={x+NODE_W-8} cy={y+8} r="9"
                      fill={isPathStart?"#4ade80":isPathEnd?"#f472b6":"#7c3aed"} opacity="0.95"/>
                  )}
                  {isOnPath && routePath && (
                    <text x={x+NODE_W-8} y={y+8} textAnchor="middle" dominantBaseline="middle"
                      fontSize="8" fontWeight="700" fontFamily="system-ui,sans-serif"
                      fill={isPathStart||isPathEnd?"#1e1e2e":"#fff"} style={{userSelect:"none"}}>
                      {isPathStart?"S":isPathEnd?"E":routePath.indexOf(p.id)}
                    </text>
                  )}
                  {isPinned && !isOnPath && (
                    <text x={x+NODE_W-10} y={y+13} fontSize="11" textAnchor="middle" style={{userSelect:"none"}}>
                      &#x1F4CC;
                    </text>
                  )}
                  <g opacity={isDim?0.2:1}>
                    <g transform={"translate("+bx+","+by+")"}>
                      <clipPath id={"bc-"+p.id}><rect width={BADGE_SIZE} height={BADGE_SIZE} rx="5"/></clipPath>
                      <rect width={BADGE_SIZE} height={BADGE_SIZE} rx="5" fill="white" opacity="0.15"/>
                      <image href={p.badge} x={0} y={0} width={BADGE_SIZE} height={BADGE_SIZE} preserveAspectRatio="xMidYMid slice" clipPath={"url(#bc-"+p.id+")"}/>
                      <rect width={BADGE_SIZE} height={BADGE_SIZE} rx="5" fill="none" stroke={m?.nBr??"#666"} strokeWidth="1" opacity="0.5"/>
                    </g>
                  </g>
                  <foreignObject x={tx2} y={y+6} width={tw} height={NODE_H-12}>
                    <div style={{fontFamily:"system-ui,sans-serif",fontSize:p.label.length>14?"9px":"10.5px",fontWeight:700,color:isDim?"rgba(255,255,255,0.12)":isOnPath?"#e9d5ff":m?.nT??"#333",lineHeight:1.2,marginBottom:3}}>{p.label}</div>
                    <div style={{fontFamily:"system-ui,sans-serif",fontSize:"8px",fontStyle:"italic",color:isDim?"rgba(255,255,255,0.06)":m?.nT??"#333",opacity:isDim?0.3:0.65,lineHeight:1.2}}>{p.gaelic}</div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Floating tooltip */}
      {ap && (
        <div style={{position:"fixed",left:tipLeft,top:tipTop,width:TIP_W,zIndex:9999,pointerEvents:selected?"auto":"none"}}>
          <div className="bg-slate-800/95 backdrop-blur border border-slate-600 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-slate-600 bg-slate-700">
                <img src={ap.badge} alt={ap.label} className="w-full h-full object-cover"/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-white font-bold text-base leading-tight">{ap.label}</h2>
                    <p className="text-slate-400 text-xs italic">{ap.gaelic}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Layer {ap.layer} &mdash; {lm[ap.layer]?.name??""}
                      {selected && <span className="ml-2 text-amber-400 font-medium">&#x1F4CC; pinned</span>}
                    </p>
                  </div>
                  {selected && (
                    <button onClick={() => setSelected(null)}
                      className="text-slate-500 hover:text-white text-base leading-none transition-colors shrink-0 mt-0.5"
                      title="Unpin">&#x2715;</button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">&#127775; Blessings</p>
                <div className="flex flex-wrap gap-1">
                  {ap.blessings.length > 0
                    ? ap.blessings.map(b => <span key={b} className="bg-amber-900/40 border border-amber-700/50 text-amber-200 text-xs px-1.5 py-0.5 rounded-full">{b}</span>)
                    : <span className="text-slate-600 text-xs italic">Not blessable</span>
                  }
                </div>
                {ap.blessingNote && <p className="text-slate-400 text-xs mt-1.5 italic leading-snug">&#8505; {ap.blessingNote}</p>}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">&#128506; Travel</p>
                <div className="space-y-1">
                  {bi.map(c => { const o=c.from===active?c.to:c.from, op=getPeak(o); return (
                    <div key={o} className="flex items-center gap-1.5">
                      <img src={op.badge} className="w-4 h-4 rounded object-cover shrink-0 border border-slate-600" alt=""/>
                      <span className="text-emerald-300 text-xs truncate">&#x21C4; {op.label}</span>
                    </div>
                  ); })}
                  {ow.map(c => { const op=getPeak(c.to); return (
                    <div key={c.to} className="flex items-center gap-1.5">
                      <img src={op.badge} className="w-4 h-4 rounded object-cover shrink-0 border border-slate-600" alt=""/>
                      <span className="text-orange-300 text-xs truncate">
                        &#x279C; {op.label}
                        {c.route && <span className="text-amber-500 italic"> &ldquo;{c.route}&rdquo;</span>}
                      </span>
                    </div>
                  ); })}
                  {inc.map(c => { const op=getPeak(c.from); return (
                    <div key={c.from} className="flex items-center gap-1.5">
                      <img src={op.badge} className="w-4 h-4 rounded object-cover shrink-0 border border-slate-600" alt=""/>
                      <span className="text-slate-500 text-xs truncate">&#x2190; {op.label}</span>
                    </div>
                  ); })}
                  {ow.length===0 && inc.length===0 && bi.length===0 && (
                    <p className="text-slate-600 text-xs italic">No connections</p>
                  )}
                </div>
              </div>
            </div>
            {!selected && (
              <p className="text-slate-600 text-xs text-center mt-2 border-t border-slate-700 pt-2">Click to pin</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
EOF

# ── Install & Build ───────────────────────────────────────────────────────────
echo "📦  Installing project dependencies..."
npm install 2>/dev/null

echo ""
echo "🔨  Building..."
npm run build 2>/dev/null

OUTPUT="$PROJECT_DIR/dist/index.html"
if [ ! -f "$OUTPUT" ]; then
  echo "❌  Build failed -- dist/index.html not found."
  exit 1
fi

echo ""
echo "✅  Build complete!"
echo ""

# ── Launch in a standalone GUI window ────────────────────────────────────────
APP_TITLE="A Highland Song -- Peak Map"
FILE_URI="file://$OUTPUT"

launch_chromium_app() {
  local bin=$1
  "$bin" --app="$FILE_URI" --name="$APP_TITLE" \
    --no-first-run --no-default-browser-check \
    --disable-extensions --disable-translate --disable-infobars \
    --window-size=1400,900 2>/dev/null &
}

launch_gtk_window() {
  local py="$PROJECT_DIR/launcher.py"
  cat > "$py" << 'PYEOF'
#!/usr/bin/env python3
import gi, sys, os
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.0')
from gi.repository import Gtk, WebKit2
win = Gtk.Window()
win.set_title("A Highland Song -- Peak Map")
win.set_default_size(1400, 900)
win.set_position(Gtk.WindowPosition.CENTER)
try: win.set_icon_name("applications-games")
except: pass
win.connect("destroy", Gtk.main_quit)
scroll = Gtk.ScrolledWindow()
scroll.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
webview = WebKit2.WebView()
settings = webview.get_settings()
settings.set_enable_javascript(True)
settings.set_enable_javascript_markup(True)
webview.load_uri("file://" + os.path.abspath(sys.argv[1]))
scroll.add(webview)
win.add(scroll)
win.show_all()
Gtk.main()
PYEOF
  python3 "$py" "$OUTPUT" 2>/dev/null &
}

echo "🖥️   Launching standalone GUI window..."

if command -v chromium-browser &>/dev/null; then launch_chromium_app "chromium-browser"
elif command -v chromium &>/dev/null; then launch_chromium_app "chromium"
elif command -v google-chrome &>/dev/null; then launch_chromium_app "google-chrome"
elif command -v google-chrome-stable &>/dev/null; then launch_chromium_app "google-chrome-stable"
elif python3 -c "import gi; gi.require_version('WebKit2','4.0'); from gi.repository import WebKit2" 2>/dev/null; then launch_gtk_window
elif command -v firefox &>/dev/null; then firefox "$FILE_URI" 2>/dev/null &
elif command -v xdg-open &>/dev/null; then xdg-open "$OUTPUT" 2>/dev/null &
else echo "⚠️   No browser found. Open manually: $OUTPUT"
fi

echo "✅  Done!"
