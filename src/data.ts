import { version } from "../package.json";

export const APP_VERSION = version;

const WIKI_IMAGES = "https://static.wikia.nocookie.net/a-highland-song/images";

export interface Peak {
  id: string;
  label: string;
  gaelic: string;
  layer: number;
  col: number;
  blessings: string[];
  blessingNote?: string;
}

export interface Connection {
  from: string;
  to: string;
  type: "one-way" | "both";
  route?: string;
  /** Pushes the arrow's curve sideways (map units) so it doesn't overlap a neighbouring arrow. */
  lane?: number;
}

export const peaks: Peak[] = [
  { id: "edge-cottage", label: "Edge Cottage", gaelic: "An Taigh", layer: 0, col: 2, blessings: [], blessingNote: "Starting location — Moira's home. Not a blessable peak." },
  { id: "bald-edge", label: "The Bald Edge", gaelic: "Lann Maol", layer: 1, col: 1, blessings: ["Rusty Blade", "Bottle Top", "Sheep's Jawbone", "Glass Fragment", "Razor Blade", "Tuna Can Lid", "Metal Barb"], blessingNote: "Anything sharp enough to shave with." },
  { id: "giants-tooth", label: "The Giant's Tooth", gaelic: "Fiacail an Fhamhair", layer: 1, col: 3, blessings: ["Sheep's Jawbone", "Small Sharp Tooth", "Cow's Tooth"] },
  { id: "little-guard", label: "Little Guard", gaelic: "Fear-faire Beag", layer: 2, col: 0, blessings: ["Fisherman's Knife", "Bronze Dagger", "Spectacles", "Eye Patch", "Razor Blade", "Glass Monocle", "Broken Whistle", "Glass Lens"], blessingNote: "Anything that helps it keep watch or stand guard." },
  { id: "outer-wall", label: "The Outer Wall", gaelic: "Balla a-Muigh", layer: 2, col: 1, blessings: ["Playing Card", "Thistle Flower", "Crow's Feather"] },
  { id: "gulls-perch", label: "Gull's Perch", gaelic: "Spiris Faoileag", layer: 2, col: 2, blessings: ["Any Feather", "Winged Brass Pin"] },
  { id: "pillars", label: "The Pillars", gaelic: "Na Colbhan", layer: 2, col: 3, blessings: ["Any Feather", "Winged Brass Pin"] },
  { id: "fall-fell", label: "Fall Fell", gaelic: "Tuiteam Mòintich", layer: 2, col: 4, blessings: ["Top Half of Fishing Rod", "Grass-Reed Boat", "Seashell", "Bottle Top"] },
  { id: "queens-throne", label: "The Queen's Throne", gaelic: "Crùn na Banrigh", layer: 2, col: 5, blessings: ["Gold Wedding Band", "Thistle Flower", "Lavender Sprig", "Yellow Broom", "Golden Flower", "Golden Brooch"] },
  { id: "hopes-ladder", label: "Hope's Ladder", gaelic: "Dréimire an Dòchas", layer: 3, col: 0, blessings: ["Wooden Rung", "Climbing Clip"] },
  { id: "lucks-out", label: "Luck's Out", gaelic: "Deireadh Fortan", layer: 3, col: 1, blessings: ["Rabbit's Foot", "Playing Card", "Dice"] },
  { id: "golden-field", label: "Golden Field", gaelic: "Achadh Òrail", layer: 3, col: 2, blessings: ["Any Gold Item", "Barley Grains"], blessingNote: "Turns the offering into a Golden Flower — the peak stays blessed and the flower can be reused elsewhere." },
  { id: "stonesong", label: "Stonesong", gaelic: "Òran Cloiche", layer: 3, col: 3, blessings: ["Tiny Bell", "Cowbell", "Broken Whistle", "Metal Flute"] },
  { id: "woes-wedding", label: "Woe's Wedding", gaelic: "Banais Bròin", layer: 3, col: 4, blessings: ["Gold Wedding Band", "Wild Rose", "Yellow Broom", "Lavender Sprig"] },
  { id: "little-finger", label: "Little Finger", gaelic: "Meur Beag", layer: 3, col: 5, blessings: ["Leather Glove", "Metal Nail File", "Gold Wedding Band"] },
  { id: "hogshead", label: "The Hogshead", gaelic: "Togsaid", layer: 3, col: 6, blessings: ["Old Bottle of Whisky", "Half-Full Hip Flask", "Whisky Cask", "Whisky Barrel"], blessingNote: "The Old Bottle of Whisky or Hip Flask also gives you a map." },
  { id: "little-pail", label: "The Little Pail o' Milk", gaelic: "Quinag", layer: 4, col: 0, blessings: ["Wooden Butter Knife", "Cowbell", "Leather Glove", "Cow's Tooth"] },
  { id: "wrestling-rock", label: "The Wrestling Rock", gaelic: "Creag Carachd", layer: 4, col: 1, blessings: ["No item — special method"], blessingNote: "Sit at the small rock west of the peak, pick positive answers to Moira's gloomy thoughts, then stand up." },
  { id: "lovers-leap", label: "The Lovers' Leap", gaelic: "Leum Leannain", layer: 4, col: 2, blessings: ["Thistle Flower", "White Rose", "Short Sword"] },
  { id: "warriors-walk", label: "The Warrior's Walk", gaelic: "Cuairt nan Gaisgeach", layer: 4, col: 3, blessings: ["Carved Stone"], blessingNote: "Sleep in the ruined house and investigate the chimney to unlock the Carved Stone." },
  { id: "moonspike", label: "Moonspike", gaelic: "Stùc na Gealaich", layer: 4, col: 4, blessings: ["Plastic Astronaut Figure", "Crescent Moon Earring", "Glass Lens"] },
  { id: "broken-promise", label: "The Broken Promise", gaelic: "Gealladh Briste", layer: 4, col: 5, blessings: ["Any Gold Item"] },
  { id: "hobsons-mine", label: "Hobson's Mine", gaelic: "Mèinn Hobson", layer: 5, col: 0, blessings: [], blessingNote: "A mine, not a peak. Toss in a Chunk of Coal and the Dented Megaphone to quiet the ghost miners, then ride the cable down to find the Iron Key to the warehouse." },
  { id: "devils-tail", label: "The Devil's Tail", gaelic: "Earball an Diabhail", layer: 5, col: 1, blessings: ["Bent Fork", "Pickaxe", "Chunk of Coal"] },
  { id: "forest-crown", label: "The Forest Crown", gaelic: "Crùn Coille", layer: 5, col: 2, blessings: ["Pine Cone"] },
  { id: "beacon-hill", label: "Beacon Hill", gaelic: "Beinn Teine", layer: 5, col: 3, blessings: ["Light both beacons — no item"], blessingNote: "Give the girl at the lower beacon a fire source (tinder box, lighter…), then fill the upper beacon with flammable items and light it." },
  { id: "watchers-eye", label: "Watcher's Eye", gaelic: "Sùil an Fhreiceadain", layer: 6, col: 0, blessings: ["Glass Monocle", "Spectacles", "Eye Patch", "Glass Lens"] },
  { id: "the-beak", label: "The Beak", gaelic: "An Gob", layer: 6, col: 1, blessings: ["Any Item", "Lavender Sprig"], blessingNote: "Any item in the crack blesses it — but Lavender makes the peak sneeze you over to the snow near Witches' Peak." },
  { id: "eagles-nest", label: "Eagle's Nest", gaelic: "Nead Iolaire", layer: 6, col: 2, blessings: ["Eagle Feather", "Massive Quartz Rock"], blessingNote: "The eagles carry you on a ride. The quartz rock turns up again on later runs for another flight." },
  { id: "crofters-echo", label: "Crofter's Echo", gaelic: "Mac-talla Chroitear", layer: 6, col: 3, blessings: ["Pocket Handkerchief", "Pocket Mirror", "Wooden Butter Knife", "Boot Lace", "Dice"] },
  { id: "broken-tooth", label: "The Broken Tooth", gaelic: "Fiacail Briste", layer: 7, col: 0, blessings: ["Any Tooth", "Hard-Boiled Sweet"] },
  { id: "witches-peak", label: "Witches' Peak", gaelic: "Stùc Buidsichean", layer: 7, col: 1, blessings: ["Any Feather"] },
  { id: "sharpstone", label: "Sharpstone", gaelic: "Clach Gheur", layer: 7, col: 2, blessings: ["Twisted Bit of Metal", "Rusty Barb", "Tent Peg", "Glass Fragment", "Any Knife or Blade"] },
  { id: "demons-wall", label: "The Demon's Wall", gaelic: "Balla Deamhain", layer: 8, col: 0, blessings: ["Rabbit's Skull", "Rabbit's Foot", "Sheep's Jawbone", "Bent Fork", "Winged Brass Pin", "Deer Antler", "Small Sharp Tooth"] },
  { id: "lions-back", label: "The Lion's Back", gaelic: "Druim an Leòmhann", layer: 8, col: 1, blessings: ["Bronze Dagger", "Roman Coin", "White Rose", "Golden Brooch", "Thistle Flower"] },
  { id: "lightning-stone", label: "The Lightning Stone", gaelic: "Clach Dealanach", layer: 8, col: 2, blessings: ["Any Metal Item", "Torch", "Purple Crystal"], blessingNote: "Don't bless it during a thunderstorm — lightning strikes hurt!" },
  { id: "sea-wall", label: "The Sea Wall", gaelic: "Balla Mara", layer: 8, col: 3, blessings: ["Grass-Reed Boat", "Seashell", "Chunk of Green Seaglass", "Top Half of Fishing Rod"] },
  { id: "lighthouse", label: "The Lighthouse", gaelic: "Taigh Solais", layer: 9, col: 1, blessings: ["Moira's Torch"], blessingNote: "Only blessable after all 35 other peaks — and it leads to a unique ending." },
];

export const connections: Connection[] = [
  { from: "edge-cottage", to: "bald-edge", type: "one-way", route: "Cross to the higher ridge" },
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
  { from: "pillars", to: "woes-wedding", type: "one-way", lane: 10 },
  { from: "fall-fell", to: "queens-throne", type: "one-way" },
  { from: "fall-fell", to: "woes-wedding", type: "one-way", lane: -10 },
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
  { from: "eagles-nest", to: "crofters-echo", type: "both" },
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

/** Journal badge emblems: [image path, width, height, circle cx, cy, r] in the source image's pixels. */
const EMBLEMS: Record<string, [string, number, number, number, number, number]> = {
  "edge-cottage": ["/b/b5/Moira.png", 352, 514, 176, 170, 150],
  "bald-edge": ["/3/38/Bald_Edge_badge.png", 604, 204, 114, 104, 86],
  "giants-tooth": ["/e/e0/Screenshot_2024-01-28_at_3.42.57_PM.png", 622, 210, 110, 112, 86],
  "little-guard": ["/b/bd/Screenshot_2024-01-28_at_4.21.25_PM.png", 608, 214, 116, 102, 85],
  "outer-wall": ["/7/77/Outer_Wall.png", 606, 220, 110, 104, 85],
  "gulls-perch": ["/7/79/Screenshot_2024-01-28_at_4.24.09_PM.png", 770, 254, 667, 121, 85],
  "pillars": ["/7/74/The_Pillars.png", 604, 232, 110, 107, 85],
  "fall-fell": ["/c/c5/Fall_Fell.png", 768, 244, 668, 129, 85],
  "queens-throne": ["/3/30/Queen%27s_Throne.png", 752, 238, 652, 119, 85],
  "hopes-ladder": ["/8/82/Screenshot_2024-01-28_at_4.56.08_PM.png", 754, 238, 656, 126, 84],
  "lucks-out": ["/0/00/Luck%27s_Out.png", 762, 228, 658, 117, 86],
  "golden-field": ["/8/83/Golden_Field.png", 758, 244, 656, 120, 85],
  "stonesong": ["/c/ce/Stonesong.png", 578, 210, 114, 104, 85],
  "woes-wedding": ["/8/89/Woe%27s_Wedding.png", 748, 230, 650, 116, 85],
  "little-finger": ["/a/a7/Little_Finger.png", 752, 246, 657, 119, 85],
  "hogshead": ["/4/43/Hogshead.png", 562, 228, 104, 121, 85],
  "little-pail": ["/a/ae/Little_Pail_o%27_Milk.png", 758, 260, 101, 150, 85],
  "wrestling-rock": ["/7/74/Wrestling_Rock.png", 718, 228, 101, 131, 85],
  "lovers-leap": ["/7/70/Lovers_Leap.png", 736, 220, 118, 122, 85],
  "warriors-walk": ["/b/bb/Warriors_Walk.png", 750, 224, 114, 104, 85],
  "moonspike": ["/5/54/Moonspike.png", 586, 226, 112, 104, 85],
  "broken-promise": ["/0/04/Broken_Promise.png", 764, 262, 666, 128, 85],
  "hobsons-mine": ["/c/cb/HObson.png", 1552, 922, 776, 461, 440],
  "devils-tail": ["/4/47/Devil%27s_Tail.png", 748, 218, 652, 114, 85],
  "forest-crown": ["/7/74/Forest_Crown.png", 758, 234, 656, 122, 84],
  "beacon-hill": ["/b/b9/Beacon_Hill.png", 748, 234, 650, 112, 84],
  "watchers-eye": ["/1/11/Watcher%27s_Eye.png", 614, 214, 108, 105, 86],
  "the-beak": ["/3/3a/The_Beak.png", 558, 206, 116, 105, 85],
  "eagles-nest": ["/7/7e/Eagle%27s_Nest.png", 548, 224, 108, 115, 85],
  "crofters-echo": ["/a/aa/Screenshot_2024-01-28_at_10.54.59_PM.png", 618, 208, 118, 98, 85],
  "broken-tooth": ["/c/c6/Broken_Tooth.png", 752, 240, 660, 126, 84],
  "witches-peak": ["/8/83/Witches%27_Peak.png", 752, 244, 650, 128, 85],
  "sharpstone": ["/8/8a/Sharpstone.png", 760, 236, 658, 121, 84],
  "demons-wall": ["/0/0e/Demon%27s_Wall.png", 756, 258, 656, 126, 84],
  "lions-back": ["/6/6c/Lion%27s_Back.png", 624, 242, 118, 116, 86],
  "lightning-stone": ["/e/ec/Screenshot_2024-01-28_at_11.36.01_PM.png", 774, 246, 114, 138, 85],
  "sea-wall": ["/d/df/Sea_Wall.png", 596, 222, 106, 110, 85],
  "lighthouse": ["/1/15/The_Lighthouse.png", 586, 230, 106, 114, 85],
};

export interface Emblem { url: string; w: number; h: number; cx: number; cy: number; r: number }

export function emblemFor(id: string): Emblem | null {
  const e = EMBLEMS[id];
  if (!e) return null;
  // The wiki's 400 px rendition keeps downloads small; crop maths stays in source pixels via the image's viewBox.
  return { url: `${WIKI_IMAGES}${e[0]}/revision/latest/scale-to-width-down/400`, w: e[1], h: e[2], cx: e[3], cy: e[4], r: e[5] };
}

export interface LayerMeta { name: string; color: string }

export const LAYERS: LayerMeta[] = [
  { name: "Home", color: "#f59e0b" },
  { name: "Entry Peaks", color: "#34d399" },
  { name: "First Range", color: "#60a5fa" },
  { name: "Loch Hills", color: "#38bdf8" },
  { name: "Valley & Dam", color: "#a78bfa" },
  { name: "Upper Hills", color: "#f472b6" },
  { name: "High Peaks", color: "#fb923c" },
  { name: "Snow Peaks", color: "#7dd3fc" },
  { name: "Coastal Range", color: "#facc15" },
  { name: "The Lighthouse", color: "#f59e0b" },
];

export const peakById = new Map(peaks.map(p => [p.id, p]));
export const getPeak = (id: string) => peakById.get(id)!;
export const BLESSABLE = peaks.filter(p => p.blessings.length > 0);

/** Offering names that were renamed to match the game; keeps older saved selections valid. */
export const RENAMED_OFFERINGS: Record<string, string> = {
  "Wedding Band": "Gold Wedding Band",
  "Flute": "Metal Flute",
  "Bottle of Whisky": "Old Bottle of Whisky",
};

export function linksOf(id: string) {
  return {
    both: connections.filter(c => c.type === "both" && (c.from === id || c.to === id)).map(c => ({ id: c.from === id ? c.to : c.from, conn: c })),
    out: connections.filter(c => c.type === "one-way" && c.from === id).map(c => ({ id: c.to, conn: c })),
    in: connections.filter(c => c.type === "one-way" && c.to === id).map(c => ({ id: c.from, conn: c })),
  };
}

const adjacency: Record<string, string[]> = Object.fromEntries(peaks.map(p => [p.id, []]));
for (const c of connections) {
  adjacency[c.from].push(c.to);
  if (c.type === "both") adjacency[c.to].push(c.from);
}

/** Shortest route by hop count (BFS), following arrow directions. */
export function findPath(startId: string, endId: string): string[] | null {
  if (startId === endId) return [startId];
  const prev = new Map<string, string>([[startId, startId]]);
  const queue = [startId];
  while (queue.length) {
    const id = queue.shift()!;
    for (const n of adjacency[id]) {
      if (prev.has(n)) continue;
      prev.set(n, id);
      if (n === endId) {
        const path = [n];
        while (path[0] !== startId) path.unshift(prev.get(path[0])!);
        return path;
      }
      queue.push(n);
    }
  }
  return null;
}

/** The connection used to step from `a` to `b`, if any. */
export function connectionBetween(a: string, b: string) {
  return connections.find(c => (c.from === a && c.to === b) || (c.type === "both" && c.from === b && c.to === a));
}
