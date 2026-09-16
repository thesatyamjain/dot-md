#!/bin/sh
set -e

# ============================================================
#   dot md - Cross-Platform Installer (macOS & Linux)
# ============================================================

BOLD='\033[1m'
TERRA='\033[38;2;200;90;43m'
GREEN='\033[32m'
RESET='\033[0m'

echo ""
printf "${BOLD}${TERRA}dot md${RESET} - Publication-grade Markdown editor installer\n"
echo "============================================================"

# 1. Verify Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required but was not found in PATH."
  echo "Please install Node.js (>= 16.0.0) and try again."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OS="$(uname -s)"

# Determine bin destination directory
if [ "$(id -u)" -eq 0 ]; then
  BIN_DIR="/usr/local/bin"
  SHARE_DIR="/usr/local/share/dot-md"
else
  BIN_DIR="$HOME/.local/bin"
  SHARE_DIR="$HOME/.local/share/dot-md"
fi

mkdir -p "$BIN_DIR"
mkdir -p "$SHARE_DIR"

echo "Copying application core to $SHARE_DIR..."
cp -R "$SCRIPT_DIR/bin" "$SHARE_DIR/"
cp -R "$SCRIPT_DIR/lib" "$SHARE_DIR/"
cp "$SCRIPT_DIR/package.json" "$SHARE_DIR/"
[ -f "$SCRIPT_DIR/template.html" ] && cp "$SCRIPT_DIR/template.html" "$SHARE_DIR/"
[ -f "$SCRIPT_DIR/favicon.svg" ] && cp "$SCRIPT_DIR/favicon.svg" "$SHARE_DIR/"
[ -f "$SCRIPT_DIR/favicon.ico" ] && cp "$SCRIPT_DIR/favicon.ico" "$SHARE_DIR/"
[ -d "$SCRIPT_DIR/node_modules" ] && cp -R "$SCRIPT_DIR/node_modules" "$SHARE_DIR/"

# Create CLI executable wrapper in BIN_DIR
CLI_WRAPPER="$BIN_DIR/dotmd"
CLI_WRAPPER_ALT="$BIN_DIR/dot-md"

cat <<EOF > "$CLI_WRAPPER"
#!/bin/sh
exec node "$SHARE_DIR/bin/cli.js" "\$@"
EOF

chmod +x "$CLI_WRAPPER"
ln -sf "$CLI_WRAPPER" "$CLI_WRAPPER_ALT"
printf "${GREEN}✔${RESET} Created CLI command: ${BOLD}%s${RESET}\n" "$CLI_WRAPPER"

# 2. Platform-specific desktop integration
if [ "$OS" = "Linux" ]; then
  if [ "$(id -u)" -eq 0 ]; then
    APP_DIR="/usr/share/applications"
    ICON_DIR="/usr/share/icons/hicolor/scalable/apps"
  else
    APP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
    ICON_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor/scalable/apps"
  fi

  mkdir -p "$APP_DIR"
  mkdir -p "$ICON_DIR"

  [ -f "$SHARE_DIR/favicon.svg" ] && cp "$SHARE_DIR/favicon.svg" "$ICON_DIR/dot-md.svg"

  DESKTOP_FILE="$APP_DIR/dot-md.desktop"
  cat <<EOF > "$DESKTOP_FILE"
[Desktop Entry]
Version=1.0
Type=Application
Name=dot md
GenericName=Markdown Editor & Viewer
Comment=Publication-grade Markdown editor and standalone viewer
Exec=$CLI_WRAPPER %F
Icon=dot-md
Terminal=false
MimeType=text/markdown;text/x-markdown;text/plain;
Categories=Utility;TextEditor;Office;
Keywords=markdown;editor;viewer;preview;
StartupWMClass=dot md
Actions=Preview;

[Desktop Action Preview]
Name=Preview with dot md
Exec=$CLI_WRAPPER %F
EOF
  chmod +x "$DESKTOP_FILE"
  printf "${GREEN}✔${RESET} Installed desktop entry: %s\n" "$DESKTOP_FILE"

  if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$APP_DIR" 2>/dev/null || true
  fi

  if command -v xdg-mime >/dev/null 2>&1; then
    xdg-mime default dot-md.desktop text/markdown 2>/dev/null || true
    xdg-mime default dot-md.desktop text/x-markdown 2>/dev/null || true
    printf "${GREEN}✔${RESET} Registered MIME file associations (.md, .markdown, .mdown)\n"
  fi

elif [ "$OS" = "Darwin" ]; then
  if [ "$(id -u)" -eq 0 ]; then
    MACOS_APPS="/Applications"
  else
    MACOS_APPS="$HOME/Applications"
  fi

  APP_BUNDLE="$MACOS_APPS/dot md.app"
  CONTENTS="$APP_BUNDLE/Contents"
  MACOS="$CONTENTS/MacOS"
  RESOURCES="$CONTENTS/Resources"

  mkdir -p "$MACOS"
  mkdir -p "$RESOURCES"

  cat <<EOF > "$CONTENTS/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>dot-md</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.dotmd.app</string>
    <key>CFBundleName</key>
    <string>dot md</string>
    <key>CFBundleDisplayName</key>
    <string>dot md</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>CFBundleDocumentTypes</key>
    <array>
        <dict>
            <key>CFBundleTypeName</key>
            <string>Markdown Document</string>
            <key>CFBundleTypeRole</key>
            <string>Editor</string>
            <key>LSHandlerRank</key>
            <string>Alternate</string>
            <key>CFBundleTypeExtensions</key>
            <array>
                <string>md</string>
                <string>markdown</string>
                <string>mdown</string>
            </array>
        </dict>
    </array>
</dict>
</plist>
EOF

  cat <<EOF > "$MACOS/dot-md"
#!/bin/sh
exec "$CLI_WRAPPER" "\$@"
EOF
  chmod +x "$MACOS/dot-md"
  [ -f "$SHARE_DIR/favicon.ico" ] && cp "$SHARE_DIR/favicon.ico" "$RESOURCES/AppIcon.icns"

  LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
  if [ -f "$LSREGISTER" ]; then
    "$LSREGISTER" -f "$APP_BUNDLE" 2>/dev/null || true
  fi
  printf "${GREEN}✔${RESET} Created macOS Application: %s\n" "$APP_BUNDLE"
fi

# Ensure BIN_DIR is in PATH
case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *) echo "Note: Add $BIN_DIR to your PATH if not already present:"
     echo "  export PATH=\"\$PATH:$BIN_DIR\"" ;;
esac

echo ""
printf "${GREEN}${BOLD}Installation Complete!${RESET}\n"
echo "You can now run: dotmd <file.md>"
echo ""
