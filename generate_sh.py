#!/usr/bin/env python3
"""Regenerates highland_song_map.sh with all current source files embedded."""
import os

DIR = os.path.dirname(os.path.abspath(__file__))

def read(rel):
    with open(os.path.join(DIR, rel)) as f:
        return f.read().rstrip("\n")

# ── Read all project files ──────────────────────────────────────────────────
pkg        = read("package.json")
tsconfig   = read("tsconfig.json")
indexHtml  = read("index.html")
viteConf   = read("vite.config.ts")
cnTs       = read("src/utils/cn.ts")
indexCss   = read("src/index.css")
mainTsx    = read("src/main.tsx")
appTsx     = read("src/App.tsx")

# ── Build the shell script ──────────────────────────────────────────────────
sh = r'''#!/usr/bin/env bash

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

'''

# ── Helper: write a file inside the shell script ─────────────────────────────
def sh_cat(name, content):
    lines = [f"cat > {name} << 'EOF'"]
    for line in content.split("\n"):
        lines.append(line)
    lines.append("EOF")
    lines.append("")
    return "\n".join(lines)

sh += sh_cat("package.json",  pkg)
sh += sh_cat("vite.config.ts", viteConf)
sh += sh_cat("tsconfig.json",  tsconfig)
sh += sh_cat("index.html",     indexHtml)
sh += sh_cat("src/utils/cn.ts", cnTs)
sh += sh_cat("src/index.css",  indexCss)
sh += sh_cat("src/main.tsx",   mainTsx)
sh += sh_cat("src/App.tsx",    appTsx)

# ── Build & launch section ───────────────────────────────────────────────────
sh += r'''# ── Install & Build ───────────────────────────────────────────────────────────
echo "📦  Installing project dependencies..."
npm install 2>/dev/null

echo ""
echo "🔨  Building..."
npm run build 2>/dev/null

OUTPUT="$PROJECT_DIR/dist/index.html"
if [ ! -f "$OUTPUT" ]; then
  echo "❌  Build failed — dist/index.html not found."
  exit 1
fi

echo ""
echo "✅  Build complete!"
echo ""

# ── Launch in a standalone GUI window ────────────────────────────────────────
APP_TITLE="A Highland Song — Peak Map"
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
win.set_title("A Highland Song — Peak Map")
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
'''

with open(os.path.join(DIR, "highland_song_map.sh"), "w") as f:
    f.write(sh)

print(f"✅  Written highland_song_map.sh")
