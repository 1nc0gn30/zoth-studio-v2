#!/usr/bin/env bash
# ==============================================================================
#  ZOTH STUDIO v2 — Sovereign Alchemical Agent Cockpit Launcher
# ==============================================================================
set -euo pipefail

ROOT="/opt/zoth-studio"
if [[ ! -d "$ROOT" ]]; then
    if [[ -d "/home/neo/zothos/config/includes.chroot/opt/zoth-studio" ]]; then
        ROOT="/home/neo/zothos/config/includes.chroot/opt/zoth-studio"
    elif [[ -d "/usr/share/zoth-studio" ]]; then
        ROOT="/usr/share/zoth-studio"
    fi
fi

# Prefer dist directory if present
SERVE_DIR="$ROOT"
if [[ -d "$ROOT/dist" && -f "$ROOT/dist/index.html" ]]; then
    SERVE_DIR="$ROOT/dist"
elif [[ -d "$ROOT/public" && -f "$ROOT/public/index.html" ]]; then
    SERVE_DIR="$ROOT/public"
fi

# Dynamic port selection (prefer 3000, 8088, 8080, or next free)
find_free_port() {
    local ports=(3000 8088 8080 8008 8090 8099 8100 8101 8102)
    for p in "${ports[@]}"; do
        if ! ss -tuln 2>/dev/null | grep -q ":$p " && ! lsof -i :"$p" >/dev/null 2>&1; then
            echo "$p"
            return 0
        fi
    done
    echo "3000"
}

PORT=$(find_free_port)
URL="http://127.0.0.1:$PORT/index.html"

echo -e "\e[1;32m[⚡] Initializing Zoth Studio v2 Sovereign Cockpit...\e[0m"

# Start background web hub if not already running on this port
if ! lsof -i :"$PORT" >/dev/null 2>&1 && ! ss -tuln 2>/dev/null | grep -q ":$PORT "; then
    python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$SERVE_DIR" >/dev/null 2>&1 &
    sleep 0.6
fi

echo -e "\e[1;36m[🌐] Zoth Studio v2 live at: $URL\e[0m"

export PORT

# Autostart local daemons (memory daemon, vault, bridge) if present
if [[ -f "$ROOT/bin/zoth.js" ]]; then
    node "$ROOT/bin/zoth.js" up >/dev/null 2>&1 &
fi

# Delegate to native Python / Electron wrapper if available
if [[ -x "/usr/local/bin/zoth-studio" && "${1:-}" != "--browser" ]]; then
    exec /usr/local/bin/zoth-studio "$@"
elif [[ -x "/opt/electron/electron" && "${1:-}" != "--browser" && -f "$ROOT/main.cjs" ]]; then
    exec /opt/electron/electron --no-sandbox --disable-dev-shm-usage --disable-gpu-sandbox --enable-features=UseOzonePlatform --ozone-platform=x11 "$ROOT" "$@"
fi

# Launch in dedicated application window mode
if command -v google-chrome-stable >/dev/null 2>&1; then
    exec google-chrome-stable --no-sandbox --app="$URL" --start-maximized --class=zoth-studio >/dev/null 2>&1 &
elif command -v google-chrome >/dev/null 2>&1; then
    exec google-chrome --no-sandbox --app="$URL" --start-maximized --class=zoth-studio >/dev/null 2>&1 &
elif command -v chromium >/dev/null 2>&1; then
    exec chromium --no-sandbox --app="$URL" --start-maximized --class=zoth-studio --disable-extensions --disable-default-apps >/dev/null 2>&1 &
elif command -v firefox-esr >/dev/null 2>&1; then
    exec firefox-esr --new-window "$URL" >/dev/null 2>&1 &
elif command -v firefox >/dev/null 2>&1; then
    exec firefox --new-window "$URL" >/dev/null 2>&1 &
else
    xdg-open "$URL" 2>/dev/null || true
fi
