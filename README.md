# ⛰️ A Highland Song — Peak Travel Map

An interactive, browser-based companion for the game **A Highland Song** by inkle Ltd.
It maps all 38 locations across 10 layers — every travel connection, each peak's journal badge,
what it can be blessed with — and adds a route planner and a personal journal for tracking
offerings and field notes across playthroughs.

**Current version: `v1.2.0`** — see the [Roadmap](ROADMAP.md) for what changed and what's next.

---

## Features

### The map
- **Pan & zoom** — scroll or pinch to zoom, drag to pan, double-tap to zoom in on touch screens; zoom buttons and a "show the whole map" reset in the corner
- **Layered layout** of all 38 locations (Layer 0: Edge Cottage → Layer 9: The Lighthouse) — the 36 blessable peaks plus Edge Cottage and Hobson's Mine
- **Journal-style peak cards** showing each peak's round in-game journal badge, its English name and its Gaelic name
- **Directional arrows** — dashed amber for one-way, solid green for two-way; links that skip past a neighbouring peak arc over it instead of cutting through
- **Named route labels** on key connections (e.g. *"Cross to the higher ridge"*, *"Climb down the rocks"*)
- **Hover a peak** for a quick summary; its connections light up and everything else fades
- **On-map markers** — a green ✓ where you've left an offering, an amber count where you've written field notes
- **Collapsible legend**

### The sidebar
- **Peaks** — every location grouped by layer, with a search that matches English names, Gaelic names *and accepted offerings* (search "thistle" to see every peak that takes a Thistle Flower)
- **Peak details** — badge, Gaelic name, layer, accepted offerings, special blessing notes, and every travel link (click one to jump there)
- **Route Planner** — pick a start and end (or use *Route from here / to here* on any peak); BFS pathfinding finds the fewest hops while respecting one-way arrows, then highlights the route on the map with numbered steps
- **Journal** — blessing progress (offerings left out of 36), field-note totals by category, everything you've recorded in one list, and Export / Copy / Import backups

### Tracking
- **Offerings** — mark which offering you left at each peak; select another to swap it, or select it again to clear it
- **Field notes** — per-peak notes tagged as Item, Map, Path, Cave or General
- Everything is **saved in your browser** automatically and can be exported to / imported from a JSON file (imports merge, never overwrite)

### Everywhere
- **Phone & tablet friendly** — the map and sidebar stack on narrow screens, with a "Bigger map" toggle
- **Shareable links** — `#peak/moonspike`, `#route` and `#journal` open straight to that view
- Press **Esc** to deselect a peak

---

## Running the App

### Linux (recommended)
A self-contained shell script handles everything — Node.js installation, building, and launching:

```bash
chmod +x launch.sh
./launch.sh
```

The script will:
1. Install Node.js via `nvm` if not already present
2. Write all project source files to `~/highland-song-map`
3. Build a single self-contained `dist/index.html`
4. Open it in a standalone GUI window (Chromium `--app` mode, or a GTK WebKit2 window as a fallback, then Firefox)

See **[GETTING_STARTED.md](GETTING_STARTED.md)** for a walkthrough and fixes for common issues.

### Manual build (any platform with Node.js ≥ 18)
```bash
npm install
npm run build
# Then open dist/index.html in any browser
```

---

## Developing

```bash
npm install
npm run dev          # live-reloading dev server
npm run build        # type-check + single-file production build
```

After changing any source file, regenerate the Linux launcher so it embeds the new code:

```bash
python3 generate_sh.py
```

### Project layout

| Path | What's in it |
|---|---|
| `src/data.ts` | Peaks, connections, blessings, layer names, badge crops, and the BFS route finder |
| `src/store.ts` | Field notes and offerings: saving, loading, export/import |
| `src/components/PeakMap.tsx` | The pan/zoom map, arrows, peak cards, hover tooltip and legend |
| `src/components/PeakPanel.tsx` | Peak list and peak details (offerings, travel, field notes) |
| `src/components/RoutePanel.tsx` | Route Planner tab |
| `src/components/JournalPanel.tsx` | Journal tab: progress, backups, all notes |
| `src/components/ui.tsx` | Shared bits, including the `Emblem` badge component |
| `generate_sh.py` | Rebuilds `launch.sh` from the source files |

---

## Tech Stack

| Technology | Version | License |
|---|---|---|
| [React](https://react.dev) | 19.2.6 | MIT |
| [Vite](https://vitejs.dev) | 7.3.2 | MIT |
| [Tailwind CSS](https://tailwindcss.com) | 4.1.17 | MIT |
| [TypeScript](https://www.typescriptlang.org) | 5.9.3 | Apache-2.0 |
| [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) | 2.3.0 | MIT |
| [Lucide icons](https://lucide.dev) | 1.x | ISC |
| [clsx](https://github.com/lukeed/clsx) | 2.1.1 | MIT |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 3.4.0 | MIT |

Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces), [Caveat](https://fonts.google.com/specimen/Caveat) and [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts (SIL Open Font License).

All pathfinding is implemented with a custom **Breadth-First Search (BFS)** algorithm that fully respects the directionality of travel connections.

---

## Data Sources & Credits

### Game
**A Highland Song** is developed and published by **inkle Ltd.**
- Website: [inklestudios.com/a-highland-song](https://www.inklestudios.com/a-highland-song/)
- Steam: [store.steampowered.com/app/1240060](https://store.steampowered.com/app/1240060/A_Highland_Song/)

All game content, characters, location names, Gaelic translations, lore, and peak badge artwork are the intellectual property of **inkle Ltd. © 2023**. This project is an unofficial fan tool and is **not affiliated with, endorsed by, or produced by inkle Ltd.**

### Peak badge images
Badge images displayed on each peak node are sourced from the
**[A Highland Song Fandom Wiki](https://a-highland-song.fandom.com/wiki/A_Highland_Song_Wiki)**:
each peak page's journal-badge screenshot, located via the MediaWiki public API
(`api.php?action=query&prop=pageimages|imageinfo`). The app displays only the round emblem from each
badge, and Edge Cottage and Hobson's Mine (which have no badge) use a wiki picture instead.
Images load straight from the wiki's CDN with no referrer, since Fandom swaps hotlinked images for a placeholder.

Wiki text content is licensed under
**[CC-BY-SA](https://creativecommons.org/licenses/by-sa/3.0/)** (Creative Commons Attribution-ShareAlike 3.0).
The badge artwork images themselves are game assets and remain the intellectual property of **inkle Ltd.**

### Blessing & connection data
Peak blessing information and travel route data were compiled with reference to:

- The **[A Highland Song Fandom Wiki](https://a-highland-song.fandom.com)** (CC-BY-SA) — community-maintained peak and location articles
- The **[Blessings Guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3149441235)** on Steam Community — compiled by the inkle Discord community, with special thanks to **PVBuk** for the original spreadsheet
- The **[A Highland Song 完全攻略 & 成就指南](https://steamcommunity.com/sharedfiles/filedetails/?id=3485069468)** Steam guide — for detailed layer and path connection data

---

## Disclaimer

This is an **unofficial fan-made reference tool** created for personal and community use.

- No game assets, audio, or executable code from *A Highland Song* are included or redistributed
- Badge images are fetched at runtime directly from the Fandom wiki CDN and are not bundled with this project
- This project is **non-commercial** and **not for sale**
- All trademarks, game content, and intellectual property relating to *A Highland Song* remain the property of **inkle Ltd.**

If inkle Ltd. has any concerns about this project, please open an issue or contact the repository owner directly and it will be addressed promptly.

---

## License

The source code of this tool (React components, pathfinding logic, shell script) is released under the **MIT License**.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

> **Note:** The MIT license applies to the tool's source code only.
> It does **not** grant any rights to game assets, artwork, lore, or any other content
> owned by inkle Ltd.
