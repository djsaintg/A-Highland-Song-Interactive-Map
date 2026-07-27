# 🗺️ Roadmap

A living document of planned features, ideas, and improvements for the A Highland Song Peak Travel Map.
Community suggestions are welcome — open an issue or pull request on GitHub!

---

## 📌 Versioning Scheme

This project follows **[Semantic Versioning](https://semver.org)** — `MAJOR.MINOR.PATCH`

| Part | When it increases | Example |
|---|---|---|
| **MAJOR** | Large reworks or breaking changes to how the app is used | `1.0.0` → `2.0.0` |
| **MINOR** | New features added, fully backwards compatible | `1.0.0` → `1.1.0` |
| **PATCH** | Bug fixes, data corrections, typo fixes — no new features | `1.1.0` → `1.1.1` |

**Current release: `v1.1.0`**

---

## ✅ v1.0.0 — Released

- [x] All 38 peaks mapped across 10 layers
- [x] Directional travel arrows (one-way and bidirectional)
- [x] Named route labels on key connections (e.g. *"Cross to the higher ridge"*)
- [x] Layer 0 — Edge Cottage (home) as starting point
- [x] Journal badge artwork on every peak node
- [x] Blessings required for each peak
- [x] Special blessing notes for unusual peaks (e.g. Wrestling Rock, Beacon Hill, Warrior's Walk)
- [x] Hover tooltip anchored to cursor (follows while scrolling)
- [x] Click to pin any peak's tooltip
- [x] Route Planner — BFS pathfinding respecting arrow directionality
- [x] Route highlighting — violet glow on path nodes and edges, step numbering
- [x] Linux standalone GUI launcher (`.sh` script)
- [x] Self-contained single-file HTML build (works offline, no server needed)

---

## ✅ v1.1.0 — Released

- [x] Field Notes — per-peak manual annotations with localStorage persistence
- [x] Five structured note categories: Item, Map, Path, Cave, and General
- [x] Category-tagged notes ready for later filtering and data consolidation
- [x] Export / Copy / Import Field Notes as JSON
- [x] Import support for legacy unstructured text notes
- [x] Field Notes toolbar with a running total
- [x] Amber count badge on peaks that have recorded notes
- [x] One selected blessing offering per peak
- [x] Blessing selections persist between sessions
- [x] A selected offering can be cleared or replaced with another valid offering
- [x] Notes and blessing selections are included in JSON export/import data
- [x] Tooltip anchored beside its peak when pinned, enabling note and blessing editing
- [x] Improved non-Layer-3 peak spacing and separated crowded arrow lanes
- [x] Bidirectional arrows use visible arrowheads at both ends
- [x] Fraunces display typeface on heading and section labels
- [x] Atmospheric layered mist gradient background

---

## 📋 Planned Releases

### 🎒 v1.2.0 — Inventory, Maps & Items per Peak
Add a persistent inventory system alongside verified map and item-location data.
Built using the data gathered via the v1.1.0 Notes feature, plus public sources.

#### Inventory Tracking
- [ ] Add and remove owned items from a personal inventory
- [ ] Track item quantities when more than one copy is available
- [ ] Track collected map fragments separately from usable items
- [ ] Save inventory and collected-map state in localStorage
- [ ] Include inventory, maps, notes, and blessing assignments in JSON export/import data

#### Blessing Assignment Rules
- [ ] Connect the existing per-peak blessing tracker to owned inventory
- [ ] Assign a specific owned item to a peak as its current blessing offering
- [ ] Each owned item copy can only be assigned to **one peak at a time**
- [ ] If an item is valid for multiple peaks, assigning it to one peak reserves it and makes
  that copy unavailable to every other peak
- [ ] Clearly show which peak currently holds a reserved item
- [ ] Require the user to unassign or explicitly move an item before using that same copy elsewhere
- [ ] Allow duplicate copies of an item to be assigned separately when the inventory quantity permits it
- [ ] Prevent impossible blessing assignments when the required item is not in the inventory

#### Maps & Items per Peak
- [ ] List all known map drops for each location
- [ ] Mark fixed-location items (e.g. Golden Brooch at Warrior's Walk hearth, Purple Crystal in Hogshead caves)
- [ ] Distinguish between fixed drops and random/pool drops
- [ ] Toggle to show/hide item information on the map nodes
- [ ] Allow a Field Note marked as **Item** or **Map** to be promoted into verified inventory/location data later

### 🧭 v1.3.0 — Named Paths per Connection
Expand the connection system to show the specific in-game path name or description
for every route between peaks — not just the two home connections currently labelled.
This would make navigation much easier when trying to 100% the game, as players can
match what they see on screen to the exact route shown on the map.
- [ ] Add named path labels to all connections where the game provides one
- [ ] Show path type (deer song, scramble, cave tunnel, boat, etc.)
- [ ] Include any unlock conditions (e.g. map required, NPC interaction needed, NG+ only)

---

## 💡 Future Ideas — Unscheduled

*These are not yet assigned a version. They'll be slotted into `v1.4.0` and beyond
as priorities are decided — or bumped to `v2.0.0` if any require a significant rework.*

### 🏆 Blessed Peak Completion Checklist
Build on the existing offering-selection tracker with a separate completion checklist
for peaks that have actually been blessed in-game across multiple playthroughs.

### 🔁 New Game Plus (NG+) Routes
Mark connections and shortcuts that are only available in NG+
(e.g. the secret scramble from Moira's house to The Giant's Tooth).
Toggle NG+ mode on/off to show/hide these additional routes.

### 🗻 NPC Locations
Pin known NPC locations to the map — the Giant, the Woodsman, the Spelunker,
the Birdwatcher, the Ice Climber, Angie's Friend etc. — with a brief note
on what they offer or require.

### 🌦️ Weather-Gated Paths
Mark connections that are only passable in good weather
(e.g. certain shortcuts noted as unusable during bad weather).
Could be shown as a dashed or conditional arrow style.

### 🦅 Goshawk Locations
Mark all 20 known Goshawk locations on the map, with a toggle to show/hide them.
Useful for players chasing the goshawk-related achievements (15 needed for the final one).

### 📱 Mobile / Touch Support
The current layout is optimised for desktop. A responsive mobile layout with
touch-friendly tooltips (tap to pin rather than hover) would make it more accessible.

### 🖨️ Print / Export View
A clean, printer-friendly version of the map — no dark background, simplified colours —
so players can print it as a physical reference sheet.

### 🌐 Windows GUI (.exe)
A packaged Windows executable using Electron or similar, so Windows users get
the same standalone window experience as Linux users with the `.sh` script.

---

## 📝 Notes & Research Needed

- Path names for all connections need to be verified against the game directly —
  some may not have official names and would need descriptive labels instead
- Map/item drop data should be cross-referenced between the Fandom wiki and
  community Steam guides to ensure accuracy before adding
- NG+ exclusive routes need confirmation of exact unlock conditions

---

## 🤝 Contributing

Have an idea not listed here? Found incorrect data?
Open an issue on GitHub and label it `enhancement` or `data-correction`.
Pull requests are also welcome — see the README for setup instructions.
