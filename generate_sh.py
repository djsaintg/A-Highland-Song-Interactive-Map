#!/usr/bin/env python3
"""Generates highland_song_map.sh with App.tsx embedded as base64."""
import base64, os

app_tsx = open("src/App.tsx", "rb").read()
app_b64 = base64.b64encode(app_tsx).decode("ascii")

# Single unbroken line — no newlines inside the string
b64_block = app_b64

script = r"""#!/usr/bin/env bash

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

# ── Write project files ───────────────────────────────────────────────────────
echo "📝  Writing project files..."

mkdir -p src/utils

cat > package.json << 'EOF'
{
  "name": "highland-song-map",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "2.1.1",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "tailwind-merge": "3.4.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "4.1.17",
    "@types/node": "22.19.17",
    "@types/react": "19.2.7",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "5.1.1",
    "tailwindcss": "4.1.17",
    "typescript": "5.9.3",
    "vite": "7.3.2",
    "vite-plugin-singlefile": "2.3.0"
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
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
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

# ── App.tsx — decoded from base64 to avoid all quoting issues ─────────────────
echo "APP_B64_PLACEHOLDER" | base64 -d > src/App.tsx

# ── Install & Build ───────────────────────────────────────────────────────────
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
  "$bin" \
    --app="$FILE_URI" \
    --name="$APP_TITLE" \
    --no-first-run \
    --no-default-browser-check \
    --disable-extensions \
    --disable-translate \
    --disable-infobars \
    --window-size=1400,900 \
    2>/dev/null &
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

if command -v chromium-browser &>/dev/null; then
  launch_chromium_app "chromium-browser"
elif command -v chromium &>/dev/null; then
  launch_chromium_app "chromium"
elif command -v google-chrome &>/dev/null; then
  launch_chromium_app "google-chrome"
elif command -v google-chrome-stable &>/dev/null; then
  launch_chromium_app "google-chrome-stable"
elif python3 -c "import gi; gi.require_version('WebKit2','4.0'); from gi.repository import WebKit2" 2>/dev/null; then
  launch_gtk_window
elif command -v firefox &>/dev/null; then
  echo "⚠️   No Chromium found — opening in Firefox"
  firefox "$FILE_URI" 2>/dev/null &
elif command -v xdg-open &>/dev/null; then
  echo "⚠️   Falling back to default browser"
  xdg-open "$OUTPUT" 2>/dev/null &
else
  echo "⚠️   No browser found. Open manually:"
  echo "    $OUTPUT"
fi

echo "✅  Done!"
"""

# Replace placeholder with actual base64 block (as a single long line for base64 -d compatibility)
script = script.replace("APP_B64_PLACEHOLDER", app_b64)

with open("highland_song_map.sh", "w") as f:
    f.write(script)

print(f"Written highland_song_map.sh ({len(script):,} bytes, App.tsx base64: {len(app_b64):,} chars)")
