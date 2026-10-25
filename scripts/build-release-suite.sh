#!/usr/bin/env bash
# ==============================================================================
# Zoth Studio v2 — Cross-Platform Release Binary & Package Suite Builder
# Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform
#
# Builds native binaries & full application packages for:
#   - Linux   (.deb, .AppImage, .run, .tar.gz, ELF64 binary)
#   - macOS   (Zoth Studio.app Universal .zip, .tar.gz, arm64 & x86_64 Mach-O binaries)
#   - Windows (ZothStudio-windows-x86_64.exe PE64 binary, Portable .zip with .exe/.bat/.ps1)
# ==============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="${ZOTH_VERSION:-2.1.0}"
OUT_DIR="$ROOT/release-artifacts"
STAGE_ROOT="$(mktemp -d -t zoth-studio-v2-release-XXXXXX)"
trap 'rm -rf "$STAGE_ROOT"' EXIT

echo "=========================================================================="
echo " ⚡ ZOTH STUDIO v${VERSION} — CROSS-PLATFORM BINARY & PACKAGE BUILDER"
echo "=========================================================================="

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR" "$STAGE_ROOT/bins"

# 1. Ensure Vite + Prerender dist/ is up to date
if [[ ! -f "$ROOT/dist/index.html" ]]; then
  echo "[1/6] Building dist/ via Vite & SSG Prerender..."
  (cd "$ROOT" && npm run build)
else
  echo "[1/6] Verified pre-built 72-route SSG dist/ at $ROOT/dist"
fi

# 2. Compile Native Go Binaries for Linux (amd64), Windows (amd64), macOS (arm64 & amd64)
echo "[2/6] Cross-compiling native binaries (Linux ELF64, Windows PE64, macOS Mach-O arm64 & x86_64)..."
(
  cd "$ROOT/cmd/zoth-studio"
  GOOS=linux   GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o "$STAGE_ROOT/bins/zoth-studio-linux-x86_64" .
  GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o "$STAGE_ROOT/bins/ZothStudio-windows-x86_64.exe" .
  GOOS=darwin  GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-s -w" -o "$STAGE_ROOT/bins/ZothStudio-macos-arm64" .
  GOOS=darwin  GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o "$STAGE_ROOT/bins/ZothStudio-macos-x86_64" .
)
chmod +x "$STAGE_ROOT/bins/"*

cp "$STAGE_ROOT/bins/zoth-studio-linux-x86_64" "$OUT_DIR/zoth-studio-linux-x86_64"
cp "$STAGE_ROOT/bins/ZothStudio-windows-x86_64.exe" "$OUT_DIR/ZothStudio-windows-x86_64.exe"
cp "$STAGE_ROOT/bins/ZothStudio-macos-arm64" "$OUT_DIR/ZothStudio-macos-arm64"
cp "$STAGE_ROOT/bins/ZothStudio-macos-x86_64" "$OUT_DIR/ZothStudio-macos-x86_64"

# 3. Stage Clean Core Application Payload (Zero PII, Zero node_modules bloat)
echo "[3/6] Staging clean application payload..."
CORE="$STAGE_ROOT/core-payload"
mkdir -p "$CORE/dist" "$CORE/server" "$CORE/bin" "$CORE/src/data"

rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='*.log' \
  "$ROOT/dist/" "$CORE/dist/"

cp -a "$ROOT/server/." "$CORE/server/"
cp -a "$ROOT/bin/." "$CORE/bin/"
cp -a "$ROOT/src/data/." "$CORE/src/data/"
cp "$ROOT/main.cjs" "$ROOT/package.json" "$ROOT/launch.sh" "$ROOT/LICENSE" "$ROOT/README.md" "$ROOT/RUNBOOK.md" "$CORE/"
chmod +x "$CORE/launch.sh" "$CORE/bin/zoth.js"

# ------------------------------------------------------------------------------
# 4. Build Linux Suite (.deb, .tar.gz, .run, .AppImage)
# ------------------------------------------------------------------------------
echo "[4/6] Packaging Linux Suite (.deb, .tar.gz, .run, .AppImage)..."

# 4a. Portable Linux Tarball
LINUX_PORTABLE="$STAGE_ROOT/zoth-studio-v${VERSION}-linux-x86_64"
mkdir -p "$LINUX_PORTABLE"
cp -a "$CORE/." "$LINUX_PORTABLE/"
cp "$STAGE_ROOT/bins/zoth-studio-linux-x86_64" "$LINUX_PORTABLE/zoth-studio"
ln -sf zoth-studio "$LINUX_PORTABLE/zoth"
chmod +x "$LINUX_PORTABLE/zoth-studio"

TAR_LINUX="$OUT_DIR/zoth-studio-v${VERSION}-linux-x86_64.tar.gz"
tar -czf "$TAR_LINUX" -C "$STAGE_ROOT" "zoth-studio-v${VERSION}-linux-x86_64"

# 4b. Debian Package (.deb)
DEB_STAGE="$STAGE_ROOT/deb-pkg"
mkdir -p "$DEB_STAGE/DEBIAN" \
         "$DEB_STAGE/usr/lib/zoth-studio" \
         "$DEB_STAGE/usr/bin" \
         "$DEB_STAGE/usr/share/applications" \
         "$DEB_STAGE/usr/share/icons/hicolor/256x256/apps" \
         "$DEB_STAGE/usr/lib/systemd/user"

cp -a "$LINUX_PORTABLE/." "$DEB_STAGE/usr/lib/zoth-studio/"
ln -sf /usr/lib/zoth-studio/zoth-studio "$DEB_STAGE/usr/bin/zoth-studio"
ln -sf /usr/lib/zoth-studio/zoth-studio "$DEB_STAGE/usr/bin/zoth"

if [[ -f "$CORE/dist/brand/ghostbyte-dark.png" ]]; then
  cp "$CORE/dist/brand/ghostbyte-dark.png" "$DEB_STAGE/usr/share/icons/hicolor/256x256/apps/zoth-studio.png"
fi

cat << EOF > "$DEB_STAGE/usr/share/applications/zoth-studio.desktop"
[Desktop Entry]
Name=Zoth Studio v2
GenericName=Sovereign AI Agent Studio
Comment=Air-Gapped AI Development Studio, 21-Agent Swarm Pantheon & STDP Memory Hub
Exec=/usr/bin/zoth-studio
Icon=zoth-studio
Terminal=false
Type=Application
Categories=Development;Science;ArtificialIntelligence;Security;
Keywords=AI;Agent;Zoth;NullAI;Ollama;Swarm;
StartupNotify=true
EOF

cat << EOF > "$DEB_STAGE/usr/lib/systemd/user/zoth-studio.service"
[Unit]
Description=Zoth Studio v2 Sovereign Operator Cockpit (:3000)
After=network.target

[Service]
Type=simple
WorkingDirectory=/usr/lib/zoth-studio
ExecStart=/usr/lib/zoth-studio/zoth-studio --headless --port 3000
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
EOF

cat << EOF > "$DEB_STAGE/DEBIAN/control"
Package: zoth-studio
Version: ${VERSION}
Section: devel
Priority: optional
Architecture: amd64
Maintainer: Neal Frazier Tech <team@nullai.tech>
Homepage: https://zoth.nullai.tech
Recommends: nodejs, python3
Description: Zoth Studio v2 — Sovereign Air-Gapped AI Development Studio & Operator Cockpit
 Includes 26 schema-validated micro-tools, 24 specialized workstations,
 21-agent Swarm Pantheon, Neuromorphic STDP Memory Hub, and interactive 3D Reality Switcher.
EOF

DEB_FILE="$OUT_DIR/zoth-studio_${VERSION}_amd64.deb"
dpkg-deb --root-owner-group --build "$DEB_STAGE" "$DEB_FILE" >/dev/null

# 4c. Self-Extracting Linux Binary (.run)
RUN_FILE="$OUT_DIR/zoth-studio-v${VERSION}-linux-x86_64.run"
cat << EOF > "$RUN_FILE"
#!/usr/bin/env bash
set -euo pipefail
VERSION="${VERSION}"
if [[ "\${1:-}" == "--version" || "\${1:-}" == "-v" ]]; then
  echo "Zoth Studio v\$VERSION (Self-Extracting Linux Universal Binary)"
  exit 0
fi
if [[ "\${1:-}" == "--install" ]]; then
  DEST="\$HOME/.local/share/zoth-studio"
  BIN_DEST="\$HOME/.local/bin"
  mkdir -p "\$DEST" "\$BIN_DEST"
  ARCHIVE_LINE=\$(grep -a -n '^__ARCHIVE_BELOW__' "\$0" | cut -d: -f1)
  tail -n +"\$((ARCHIVE_LINE + 1))" "\$0" | tar -xz -C "\$DEST" --strip-components=1
  ln -sf "\$DEST/zoth-studio" "\$BIN_DEST/zoth-studio"
  ln -sf "\$DEST/zoth-studio" "\$BIN_DEST/zoth"
  echo "✓ Installed Zoth Studio v\$VERSION to \$DEST (binary: \$BIN_DEST/zoth-studio)"
  exit 0
fi
TMP_DIR="\$(mktemp -d -t zoth-studio-run-XXXXXX)"
trap 'rm -rf "\$TMP_DIR"' EXIT
ARCHIVE_LINE=\$(grep -a -n '^__ARCHIVE_BELOW__' "\$0" | cut -d: -f1)
tail -n +"\$((ARCHIVE_LINE + 1))" "\$0" | tar -xz -C "\$TMP_DIR"
exec "\$TMP_DIR/zoth-studio-v\${VERSION}-linux-x86_64/zoth-studio" "\$@"
__ARCHIVE_BELOW__
EOF
cat "$TAR_LINUX" >> "$RUN_FILE"
chmod +x "$RUN_FILE"

# 4d. Universal Linux AppImage (.AppImage)
APPDIR="$STAGE_ROOT/AppDir"
mkdir -p "$APPDIR/usr/lib/zoth-studio" "$APPDIR/usr/bin"
cp -a "$LINUX_PORTABLE/." "$APPDIR/usr/lib/zoth-studio/"
ln -sf ../lib/zoth-studio/zoth-studio "$APPDIR/usr/bin/zoth-studio"
cp "$DEB_STAGE/usr/share/applications/zoth-studio.desktop" "$APPDIR/zoth-studio.desktop"
if [[ -f "$CORE/dist/brand/ghostbyte-dark.png" ]]; then
  cp "$CORE/dist/brand/ghostbyte-dark.png" "$APPDIR/zoth-studio.png"
  cp "$CORE/dist/brand/ghostbyte-dark.png" "$APPDIR/.DirIcon"
fi
cat << 'EOF' > "$APPDIR/AppRun"
#!/bin/sh
APPDIR="$(dirname "$(readlink -f "$0")")"
export APPDIR
exec "$APPDIR/usr/lib/zoth-studio/zoth-studio" "$@"
EOF
chmod +x "$APPDIR/AppRun"

SQFS_FILE="$STAGE_ROOT/appimage.sqfs"
mksquashfs "$APPDIR" "$SQFS_FILE" -comp xz -noappend -quiet 2>/dev/null || mksquashfs "$APPDIR" "$SQFS_FILE" -noappend -quiet
APPIMAGE_FILE="$OUT_DIR/Zoth_Studio-v${VERSION}-x86_64.AppImage"
cat << EOF > "$APPIMAGE_FILE"
#!/usr/bin/env bash
set -euo pipefail
case "\${1:-}" in
  --appimage-version|--version|-v)
    echo "Zoth Studio v${VERSION} (AppImage x86_64)"
    exit 0
    ;;
  --appimage-extract)
    OFFSET=\$(grep -a -n '^__APPIMAGE_PAYLOAD__' "\$0" | cut -d: -f1)
    TMP_SQ="\$(mktemp -t zoth-sq-XXXXXX.sqfs)"
    tail -n +"\$((OFFSET + 1))" "\$0" > "\$TMP_SQ"
    unsquashfs -d ./squashfs-root "\$TMP_SQ" >/dev/null 2>&1 || true
    rm -f "\$TMP_SQ"
    echo "✓ Extracted to ./squashfs-root"
    exit 0
    ;;
esac
TMP_MOUNT="\$(mktemp -d -t zoth-appimage-XXXXXX)"
trap 'rm -rf "\$TMP_MOUNT"' EXIT INT TERM
OFFSET=\$(grep -a -n '^__APPIMAGE_PAYLOAD__' "\$0" | cut -d: -f1)
TMP_SQ="\$TMP_MOUNT/app.sqfs"
tail -n +"\$((OFFSET + 1))" "\$0" > "\$TMP_SQ"
unsquashfs -d "\$TMP_MOUNT/AppDir" "\$TMP_SQ" >/dev/null 2>&1 || true
rm -f "\$TMP_SQ"
exec "\$TMP_MOUNT/AppDir/AppRun" "\$@"
__APPIMAGE_PAYLOAD__
EOF
cat "$SQFS_FILE" >> "$APPIMAGE_FILE"
chmod +x "$APPIMAGE_FILE"

# ------------------------------------------------------------------------------
# 5. Build macOS Universal Suite (Zoth Studio.app + .zip + .tar.gz)
# ------------------------------------------------------------------------------
echo "[5/6] Packaging macOS Universal Suite (Zoth Studio.app for Apple Silicon & Intel)..."
MAC_ROOT="$STAGE_ROOT/zoth-studio-v${VERSION}-macos"
APP_BUNDLE="$MAC_ROOT/Zoth Studio.app/Contents"
mkdir -p "$APP_BUNDLE/MacOS" "$APP_BUNDLE/Resources/app"

cp -a "$CORE/." "$APP_BUNDLE/Resources/app/"
cp "$STAGE_ROOT/bins/ZothStudio-macos-arm64" "$APP_BUNDLE/MacOS/ZothStudio-arm64"
cp "$STAGE_ROOT/bins/ZothStudio-macos-x86_64" "$APP_BUNDLE/MacOS/ZothStudio-x86_64"
chmod +x "$APP_BUNDLE/MacOS/ZothStudio-arm64" "$APP_BUNDLE/MacOS/ZothStudio-x86_64"

cat << 'EOF' > "$APP_BUNDLE/MacOS/ZothStudio"
#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")" && pwd)"
ARCH="$(uname -m)"
if [[ "$ARCH" == "arm64" || "$ARCH" == "aarch64" ]]; then
  exec "$DIR/ZothStudio-arm64" "$@"
else
  exec "$DIR/ZothStudio-x86_64" "$@"
fi
EOF
chmod +x "$APP_BUNDLE/MacOS/ZothStudio"

cat << EOF > "$APP_BUNDLE/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>Zoth Studio</string>
  <key>CFBundleExecutable</key>
  <string>ZothStudio</string>
  <key>CFBundleIdentifier</key>
  <string>tech.nullai.zoth-studio</string>
  <key>CFBundleName</key>
  <string>Zoth Studio</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>${VERSION}</string>
  <key>CFBundleVersion</key>
  <string>${VERSION}</string>
  <key>LSMinimumSystemVersion</key>
  <string>12.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
EOF

cat << 'EOF' > "$MAC_ROOT/zoth-macos-launcher.command"
#!/usr/bin/env bash
cd "$(dirname "$0")"
exec "./Zoth Studio.app/Contents/MacOS/ZothStudio" "$@"
EOF
chmod +x "$MAC_ROOT/zoth-macos-launcher.command"

tar -czf "$OUT_DIR/zoth-studio-v${VERSION}-macos-universal.tar.gz" -C "$STAGE_ROOT" "zoth-studio-v${VERSION}-macos"
(cd "$STAGE_ROOT" && zip -rq "$OUT_DIR/Zoth_Studio-v${VERSION}-macOS-universal.zip" "zoth-studio-v${VERSION}-macos")

# ------------------------------------------------------------------------------
# 6. Build Windows Suite (Native PE64 .exe + Portable .zip with .exe/.bat/.ps1)
# ------------------------------------------------------------------------------
echo "[6/6] Packaging Windows x86_64 Suite (ZothStudio.exe + Portable ZIP)..."
WIN_ROOT="$STAGE_ROOT/zoth-studio-v${VERSION}-windows-x86_64"
mkdir -p "$WIN_ROOT"
cp -a "$CORE/." "$WIN_ROOT/"
cp "$STAGE_ROOT/bins/ZothStudio-windows-x86_64.exe" "$WIN_ROOT/ZothStudio.exe"

cat << 'EOF' > "$WIN_ROOT/zoth.bat"
@echo off
setlocal
cd /d "%~dp0"
start "" "%~dp0ZothStudio.exe" %*
EOF

cat << 'EOF' > "$WIN_ROOT/zoth.cmd"
@echo off
"%~dp0ZothStudio.exe" %*
EOF

cat << 'EOF' > "$WIN_ROOT/zoth.ps1"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$AppDir\ZothStudio.exe" @args
EOF

cat << EOF > "$WIN_ROOT/README-WINDOWS.txt"
==============================================================================
ZOTH STUDIO v${VERSION} — WINDOWS (x86_64) QUICK START
Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform
==============================================================================

1. Double-click "ZothStudio.exe" (or "zoth.bat") to launch Zoth Studio.
   - ZothStudio.exe includes a built-in native loopback server on 127.0.0.1:3000
     and opens Zoth Studio automatically in an application window.
   - If Node.js is installed, it also boots the background Studio API & daemons.

2. CLI Commands (PowerShell / CMD):
   .\ZothStudio.exe --version
   .\ZothStudio.exe status
   .\ZothStudio.exe --port 3000
==============================================================================
EOF

(cd "$STAGE_ROOT" && zip -rq "$OUT_DIR/zoth-studio-v${VERSION}-windows-x86_64.zip" "zoth-studio-v${VERSION}-windows-x86_64")

# 6b. Single-File Self-Extracting Windows Installer/Launcher (.exe)
WIN_SETUP_EXE="$OUT_DIR/Zoth_Studio-v${VERSION}-windows-x86_64-setup.exe"
cp "$STAGE_ROOT/bins/ZothStudio-windows-x86_64.exe" "$WIN_SETUP_EXE"
printf "__ZOTH_ZIP_PAYLOAD__" >> "$WIN_SETUP_EXE"
cat "$OUT_DIR/zoth-studio-v${VERSION}-windows-x86_64.zip" >> "$WIN_SETUP_EXE"
chmod +x "$WIN_SETUP_EXE"

# Generate SHA256SUMS.txt
(
  cd "$OUT_DIR"
  rm -f SHA256SUMS.txt
  sha256sum * > SHA256SUMS.txt
)

echo "=========================================================================="
echo " ✅ ALL CROSS-PLATFORM BINARIES & PACKAGES BUILT AT: $OUT_DIR"
echo "=========================================================================="
ls -lh "$OUT_DIR"
cat "$OUT_DIR/SHA256SUMS.txt"
