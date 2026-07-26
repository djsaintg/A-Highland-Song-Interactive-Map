# ⛰️ A Highland Song — Peak Travel Map

An interactive, browser-based reference tool for the game **A Highland Song** by inkle Ltd.
Visualises all 38 locations across 10 layers, showing travel connections with directional arrows,
journal badge artwork, blessing requirements, and a built-in route planner.

---
## Support this Project

[![Sponsor djsaintg](https://img.shields.io/badge/Sponsor-djsaintg-9ECE6A?style=for-the-badge&logo=github&logoColor=white)](https://buymeacoffee.com/djsaintg)

## Features

- **Layered map** of all 38 peaks/locations (Layer 0: Edge Cottage → Layer 9: The Lighthouse)
- **Directional arrows** showing one-way and bidirectional travel routes between peaks
- **Named route labels** on key connections (e.g. *"Cross to the higher ridge"*, *"Climb down the rocks"*)
- **Journal badge artwork** sourced from the community wiki, matching each peak's in-game badge
- **Hover tooltip** anchored to the mouse cursor — shows blessings required and travel connections
- **Click to pin** any peak's tooltip while scrolling or comparing
- **Route Planner** — select any start and end peak; BFS pathfinding highlights the shortest valid route on the map, respecting all one-way restrictions

---

## Running the App

### Linux (recommended)
A self-contained shell script handles everything — Node.js installation, building, and launching:

```bash
chmod +x highland_song_map.sh
./highland_song_map.sh
```

The script will:
1. Install Node.js via `nvm` if not already present
2. Write all project source files
3. Build a single self-contained `dist/index.html`
4. Open it in a standalone GUI window (Chromium `--app` mode, or GTK WebKit2 as fallback)

### Manual build (any platform with Node.js ≥ 18)
```bash
npm install
npm run build
# Then open dist/index.html in any browser
```

---

## Tech Stack

| Technology | Version | License |
|---|---|---|
| [React](https://react.dev) | 19.2.6 | MIT |
| [Vite](https://vitejs.dev) | 7.3.2 | MIT |
| [Tailwind CSS](https://tailwindcss.com) | 4.1.17 | MIT |
| [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) | 2.3.0 | MIT |
| [clsx](https://github.com/lukeed/clsx) | 2.1.1 | MIT |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 3.4.0 | MIT |

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
**[A Highland Song Fandom Wiki](https://a-highland-song.fandom.com/wiki/A_Highland_Song_Wiki)**,
retrieved via the MediaWiki public API (`api.php?action=query&prop=imageinfo`).

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
