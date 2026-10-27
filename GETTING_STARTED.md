# 🚀 Getting Started

This guide walks you through running the A Highland Song Peak Travel Map on your machine,
what to expect with and without an internet connection, and fixes for the most common issues
across different Linux distributions.

---

## Requirements

| Requirement | Details |
|---|---|
| Operating System | Any modern Linux distro (see notes below for specifics) |
| Node.js | ≥ 18 — **installed automatically** by the script if missing |
| Internet | Required on first run (downloads Node.js + npm packages). Optional after that. |
| Disk space | ~250 MB (Node.js + node_modules + build output) |

---

## First Run — Step by Step

### 1. Make the script executable

```bash
chmod +x launch.sh
```

You only need to do this **once**.

### 2. Run the script

```bash
./launch.sh
```

### 3. What happens next

The script will work through the following steps automatically:

```
📁  Project directory: /home/YourName/highland-song-map

⚠️   Node.js not found. Installing via nvm...     ← first run only
     ... downloads and installs Node.js LTS ...

✅  Node v24.x.x  /  npm 11.x.x

📝  Writing project files...
📦  Installing project dependencies...
🔨  Building...
🖥️   Launching standalone GUI window...
✅  Done!
```

**First run** takes 2–5 minutes (Node.js + npm packages download once, then are cached).  
**Subsequent runs** take around 15–30 seconds (just rebuilds and launches).

### 4. What you'll see

A standalone window opens showing the interactive peak map — **no browser tabs, no address bar**.

- On **Chromium/Chrome** systems: opens in `--app` mode (clean borderless window)
- On **GTK/WebKit2** systems (most GNOME desktops): opens in a native GTK window
- On **Firefox-only** systems (including Flatpak Firefox): opens as a normal browser window (still fully functional)

---

## Using the App

| To… | Do this |
|---|---|
| Zoom the map | Scroll the mouse wheel, pinch on a touchpad/touch screen, or use the **+ / −** buttons |
| Move around | Drag the map. The ⌖ button shows the whole map again |
| See a peak's summary | Hover over it — its connections light up |
| Open a peak's details | Click it on the map, or pick it from the **Peaks** list |
| Find which peaks take an item | Type the item into the **Peaks** search box (e.g. `feather`) |
| Track your offering | In a peak's details, click the offering you left — it turns green and the peak gets a ✓ |
| Write a field note | In a peak's details, pick Item / Map / Path / Cave / General, type, and press **Enter** |
| Plan a route | **Route Planner** tab, or *Route from here* / *Route to here* on any peak |
| Back up your journal | **Journal** tab → **Export** (or **Copy**). **Import** merges a backup back in |
| Deselect | Press **Esc**, click empty map, or **All peaks** |

Your offerings and notes save automatically in the browser/window you use. The Chromium app window,
the GTK window and Firefox each keep their **own** separate storage — export from one and import into
another if you switch.

---

## Internet Connection — What Works Where

| Feature | Online | Offline |
|---|---|---|
| Map layout, layers, arrows | ✅ | ✅ |
| Peak names, Gaelic subtitles | ✅ | ✅ |
| Blessings & travel connections | ✅ | ✅ |
| Route planner (pathfinding) | ✅ | ✅ |
| Peak details, offerings & field notes | ✅ | ✅ |
| Export / import journal | ✅ | ✅ |
| **Journal badge images** | ✅ | ❌ (plain mountain placeholder) |
| **Handwritten & display fonts** | ✅ | ❌ (falls back to system fonts) |

> **Why?** Badge images are fetched at runtime from the A Highland Song Fandom Wiki CDN
> (`static.wikia.nocookie.net`), and fonts from Google Fonts. Neither is bundled with the app.  
> If you're offline, each badge shows a simple mountain placeholder — everything else works perfectly.

---

## Subsequent Runs

Once Node.js and the dependencies are installed, every future run is faster:

```bash
./launch.sh
```

The script detects that everything is already in place and goes straight to building and launching.
No internet connection is needed after the first run (except for badge images as noted above).

---

## Distribution-Specific Notes

### Ubuntu / Linux Mint / Pop!_OS / Debian
Works out of the box. `nvm` installs Node.js into `~/.nvm` (your home directory) — no `sudo` needed.

```bash
chmod +x launch.sh && ./launch.sh
```

### Fedora Workstation
Works out of the box. Same as Ubuntu — `nvm` handles everything in your home directory.

### Bazzite / Fedora Silverblue / other Atomic/Immutable distros
Bazzite has a **read-only system partition** — you cannot install system packages with `dnf`.  
This is **not a problem** for this script. `nvm` installs Node.js entirely inside `~/.nvm`
(your home directory, which is always writable), so no system changes are needed.

```bash
chmod +x launch.sh && ./launch.sh
```

The script works identically on Bazzite as it does on any other distro.

### Arch Linux / Manjaro / EndeavourOS
Works out of the box via `nvm`. Alternatively, if you already have Node.js installed via `pacman`:

```bash
npm install && npm run build
# then open dist/index.html in your browser
```

### openSUSE Tumbleweed / Leap
Works via `nvm`. If `curl` is not installed:

```bash
sudo zypper install curl
chmod +x launch.sh && ./launch.sh
```

---

## Common Issues & Fixes

---

### ❌ Issue 1: `Permission denied` when running the script

**Symptom:**
```
bash: ./launch.sh: Permission denied
```

**Cause:** The script doesn't have the execute permission set.

**Fix:**
```bash
chmod +x launch.sh
./launch.sh
```

**If that still doesn't work** (e.g. script is on a USB drive or NTFS partition):
```bash
bash launch.sh
```
Running it explicitly through `bash` bypasses the execute bit requirement entirely.

---

### ❌ Issue 2: `node: command not found` after nvm installs successfully

**Symptom:**  
The script installs Node.js via nvm, but then immediately says Node isn't found.

**Cause:** nvm was installed but the current shell session hasn't loaded it yet.

**Fix — Option A:** Close and reopen your terminal, then run the script again.

**Fix — Option B:** Source nvm manually and re-run:
```bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
./launch.sh
```

**Fix — Option C:** Add nvm to your shell profile permanently:
```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc
```

---

### ❌ Issue 3: The window doesn't open / app opens in a full browser instead

**Symptom:**  
Script completes successfully but either nothing opens, or it opens as a regular browser tab
with a full address bar rather than a standalone window.

**Cause:** The script tries Chromium `--app` mode first, then a GTK WebKit2 window (WebKit2GTK 4.1 or 4.0),
then Firefox (regular or Flatpak), then `xdg-open`. If none match your setup exactly, it may fall back unexpectedly.

**Fix — find your browser binary:**
```bash
which chromium chromium-browser google-chrome firefox
```

Then open the built file directly in app mode:
```bash
# Chromium (most distros)
chromium --app=file://$HOME/highland-song-map/dist/index.html

# Google Chrome
google-chrome --app=file://$HOME/highland-song-map/dist/index.html

# Firefox (standard window)
firefox $HOME/highland-song-map/dist/index.html

# Any browser — just open the file directly
xdg-open $HOME/highland-song-map/dist/index.html
```

**On Bazzite/Fedora with a Flatpak browser:**
```bash
flatpak run org.chromium.Chromium --app=file://$HOME/highland-song-map/dist/index.html
# or
flatpak run org.mozilla.firefox $HOME/highland-song-map/dist/index.html
```

---

### ❌ Issue 4: `npm error ENOENT: no such file or directory, open 'package.json'`

**Symptom:**
```
npm error code ENOENT
npm error path /home/YourName/Documents/package.json
```

**Cause:** The script is being run from the wrong directory, or a previous run failed partway
through writing files, leaving the project folder incomplete.

**Fix — delete the project folder and start fresh:**
```bash
rm -rf ~/highland-song-map
./launch.sh
```

The script will recreate everything cleanly from scratch.

---

### ❌ Issue 5: `npm install` hangs / freezes with no output

**Symptom:**  
The script prints `📦 Installing project dependencies...` and then freezes indefinitely.

**Cause:** npm is waiting on a network request that isn't completing, or the npm registry
is being slow. This is most common on first run or with a slow/unstable connection.

**Fix — wait a few minutes first.** npm can legitimately take 2–4 minutes on a slow connection.
If it's been more than 10 minutes:

**Fix — clear the npm cache and retry:**
```bash
npm cache clean --force
rm -rf ~/highland-song-map/node_modules
./launch.sh
```

**Fix — make sure you're using the official npm registry:**
```bash
cd ~/highland-song-map
npm install --registry https://registry.npmjs.org
```

**Fix — check your internet connection:**
```bash
curl -I https://registry.npmjs.org
```
If this times out, the issue is your connection, not the script.

---

### ❌ Issue 6: The script stops at `🔨 Building...` with errors

**Cause:** Usually a very old Node.js version, or a half-finished earlier run.

**Fix:** The script prints the build errors above the ❌ line. Check `node --version` is **18 or newer**
(`nvm install --lts` upgrades it), then delete the project folder and run the script again:
```bash
rm -rf ~/highland-song-map
./launch.sh
```

---

## Manual Build (Alternative to the Script)

If you already have Node.js ≥ 18 installed and just want to build manually:

```bash
# Clone or download the repo, then:
cd highland-song-map
npm install
npm run build
# Open dist/index.html in any browser
```

The output is a single self-contained `dist/index.html` file — you can copy it anywhere
and open it without a server or any other dependencies.

---

## Still Stuck?

Open an issue on the GitHub repository describing:
1. Your Linux distribution and version
2. The exact error message you see
3. The output of `node --version` and `npm --version` (if available)