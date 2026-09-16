#!/bin/sh
set -e

# ============================================================
#   dot md - Cross-Platform Uninstaller (macOS & Linux)
# ============================================================

BOLD='\033[1m'
TERRA='\033[38;2;200;90;43m'
GREEN='\033[32m'
RESET='\033[0m'

echo ""
printf "${BOLD}${TERRA}dot md${RESET} - Uninstaller\n"
echo "============================================================"

OS="$(uname -s)"

if [ "$(id -u)" -eq 0 ]; then
  BIN_DIR="/usr/local/bin"
  SHARE_DIR="/usr/local/share/dot-md"
else
  BIN_DIR="$HOME/.local/bin"
  SHARE_DIR="$HOME/.local/share/dot-md"
fi

# 1. Remove CLI commands
rm -f "$BIN_DIR/dotmd" "$BIN_DIR/dot-md"
printf "${GREEN}✔${RESET} Removed CLI commands from %s\n" "$BIN_DIR"

# 2. Remove application share files
if [ -d "$SHARE_DIR" ]; then
  rm -rf "$SHARE_DIR"
  printf "${GREEN}✔${RESET} Removed application directory: %s\n" "$SHARE_DIR"
fi

# 3. Platform desktop cleanup
if [ "$OS" = "Linux" ]; then
  if [ "$(id -u)" -eq 0 ]; then
    APP_DIR="/usr/share/applications"
    ICON_DIR="/usr/share/icons/hicolor/scalable/apps"
  else
    APP_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/applications"
    ICON_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor/scalable/apps"
  fi

  rm -f "$APP_DIR/dot-md.desktop"
  rm -f "$ICON_DIR/dot-md.svg"
  if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$APP_DIR" 2>/dev/null || true
  fi
  printf "${GREEN}✔${RESET} Removed Linux desktop integration\n"

elif [ "$OS" = "Darwin" ]; then
  if [ "$(id -u)" -eq 0 ]; then
    MACOS_APPS="/Applications"
  else
    MACOS_APPS="$HOME/Applications"
  fi

  APP_BUNDLE="$MACOS_APPS/dot md.app"
  if [ -d "$APP_BUNDLE" ]; then
    rm -rf "$APP_BUNDLE"
    LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister"
    if [ -f "$LSREGISTER" ]; then
      "$LSREGISTER" -u "$APP_BUNDLE" 2>/dev/null || true
    fi
    printf "${GREEN}✔${RESET} Removed macOS Application: %s\n" "$APP_BUNDLE"
  fi
fi

# 4. Clean local caches
rm -rf "$HOME/.cache/dot-md" "$HOME/.config/dot-md"
rm -rf "$HOME/Library/Caches/dot-md" "$HOME/Library/Application Support/dot-md" 2>/dev/null || true
printf "${GREEN}✔${RESET} Purged local cache and configuration\n"

echo ""
printf "${GREEN}${BOLD}Uninstallation Complete!${RESET}\n"
echo "dot md was successfully removed from your system."
echo ""
