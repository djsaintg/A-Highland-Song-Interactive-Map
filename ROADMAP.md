# 🗺️ Roadmap

A living document of planned features, ideas, and improvements for the A Highland Song Peak Travel Map.
Community suggestions are welcome — open an issue or pull request on GitHub!

---

## ✅ Completed

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

## 🔧 In Progress

Working on adding a 'notes' section to each mountain peak for manually adding;
- which map fragment/item was found on that peak.
- which path leads from that peak and which peak it leads to specifically
- app will save input data for consolidation with all other public info in order to make each futre update as reliable and accurate as possible

---

## 📋 Planned Features

### 🗒️ Maps & Items per Peak
Show which map fragments and items can be found at or near each peak.
- List all known map drops for each location
- Mark fixed-location items (e.g. Golden Brooch at Warrior's Walk hearth, Purple Crystal in Hogshead caves)
- Distinguish between fixed drops and random/pool drops
- Toggle to show/hide item information on the map nodes

### 🧭 Named Paths per Connection
Expand the connection system to show the specific in-game path name or description
for every route between peaks — not just the two home connections currently labelled.
This would make navigation much easier when trying to 100% the game, as players can
match what they see on screen to the exact route shown on the map.
- Add named path labels to all connections where the game provides one
- Show path type (deer song, scramble, cave tunnel, boat, etc.)
- Include any unlock conditions (e.g. map required, NPC interaction needed, NG+ only)

---

## 💡 Future Ideas

### 🏆 Blessing Tracker / Checklist
An interactive checklist overlay so players can tick off peaks they've already blessed
across multiple playthroughs. State could be saved to localStorage so it persists between sessions.

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
