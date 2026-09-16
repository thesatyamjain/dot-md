# dot md

> Publication-grade Markdown editor and viewer. Zero-terminal execution, sub-50ms live preview, curated editorial typography, and self-contained document workflows across Windows, macOS, and Linux.

---

## Overview

`dot md` bridges the gap between raw text editing and publication-grade document presentation. Unlike generic previewers that bundle heavy browser runtimes or require remote cloud services, `dot md` operates entirely locally with two modern execution tiers: a high-performance **Tauri (Rust)** native desktop application, and an ultra-lightweight **Cross-Platform CLI**.

---

## Key Capabilities

### Editorial Typography & Design
- **Curated Font Pairing**: Combines **Satoshi** display typography with **Geist Mono** for code, calibrated to a comfortable 65–75ch reading measure.
- **Three Atmospheric Themes**:
  - **Editorial Dark**: Matte carbon canvas (`#0e1117`) with rich terracotta accents (`#c85a2b`).
  - **Alabaster Light**: Soft cream paper palette (`#fcfbfa`) engineered for prolonged daylight reading.
  - **Warm Sepia**: Low-contrast, book-like reading canvas.
- **Fluid Reading Modes**:
  - **Zen Focus Mode (`Z`)**: Distraction-free reading view that hides chrome, outlines, and toolbars.
  - **Wide View Mode (`W`)**: Expands the reading measure to utilize ultra-wide monitors.
  - **Sticky Outline Drawer (`O`)**: Dynamic Table of Contents with smooth scrollspy tracking and heading depth hierarchy.

### Two-Way Visual & Raw Markdown Editor
- **Seamless Split / Switch (`R`)**: Toggle instantly between rich formatted preview and an IDE-grade raw editor with line numbers and word wrap.
- **Instant Save (`Ctrl+S` / `Cmd+S`)**: Saves edits back to the original source file with zero lag and atomic write safeguards.
- **Self-Contained Image Pasting (`Ctrl+V`)**: Intercepts image clipboard data and embeds screenshots directly as inline Base64 data URIs. No broken image links or messy companion asset folders.
- **ASCII Table Auto-Aligner (`Ctrl+Shift+T`)**: Automatically aligns messy Markdown pipe delimiters and dashes into clean, readable vertical columns. Includes an interactive table generation dialog.

### Technical & Publication Blocks
- **GitHub-Flavored Callouts**: Native alerts for `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, and `[!CAUTION]` with custom iconography.
- **Math & Diagrams**: Client-side rendering for **KaTeX** math equations and **Mermaid** flowcharts, sequence diagrams, and architecture maps.
- **Publication-Grade Print & PDF Engine (`P` / `Ctrl+P`)**:
  - Automatic `table-header-group` repeating headers across multi-page tables.
  - Prevents split table rows (`break-inside: avoid`).
  - Eliminates orphaned headings at page breaks (`break-after: avoid`).
  - Protects code blocks, callouts, and diagrams from being severed across page transitions.

---

## Architecture & Execution Modes

`dot md` supports two streamlined execution tiers to fit any workflow or environment:

| Attribute | **1. Tauri Desktop App (Rust)** | **2. Cross-Platform CLI (Node)** |
| :--- | :--- | :--- |
| **Runtime Core** | Rust 2021 + System Webview | Node.js (>= 16.0.0) |
| **Idle Memory** | ~30–40 MB RAM | ~50–70 MB RAM |
| **IPC Mechanism** | Native OS IPC (Zero open ports) | Server-Sent Events (SSE) |
| **Binary Size** | ~5 MB standalone executable | ~1.5 MB package distribution |
| **Platform Target** | Windows 10/11, macOS, Linux | Any OS with Node.js installed |
| **Best For** | Standalone production desktop app & OS associations | Scripting, remote terminals, npx, instant headless previews |

### 1. Tauri Desktop Architecture (`src-tauri/`)
- Pure Rust 2021 backend with Tauri v2 runtime.
- Uses Rust's `notify` crate for kernel-level file watching without CPU polling.
- Parses Markdown via `pulldown-cmark` for sub-millisecond AST conversion.
- Generates native system installers (`.msi`, `.exe` via WiX on Windows, `.dmg` on macOS, `.deb`/`.AppImage` on Linux).
- Global Tauri IPC bridge with secure capabilities configuration ([`src-tauri/capabilities/default.json`](file:///e:/md-visual/src-tauri/capabilities/default.json)).

### 2. Cross-Platform CLI (`bin/cli.js`)
- Runs anywhere Node.js is installed (`npx dotmd document.md`).
- Detects Chromium-based browsers (Edge, Chrome, Brave, Chromium) to launch dedicated chromeless application windows (`--app=http://localhost:PORT`).
- Falls back to default system browsers via `start` (Windows), `open` (macOS), or `xdg-open` (Linux).


---

## Installation & OS Integration

`dot md` adheres strictly to industry standard packaging toolchains across all supported platforms.

### Windows
- **Microsoft Windows Installer (MSI)**:
  - Enterprise-grade `.msi` package generated with the WiX Toolset.
  - Silent/GPO deployable: `msiexec /i dot-md_x64_en-US.msi /quiet`
  - Registers standard Windows uninstall entry and `.md` file associations.
- **NSIS Setup (.exe)**:
  - Standard user-space setup wizard with automatic UAC elevation, desktop shortcuts, Start Menu integration, and right-click *"Open with dot md"* context menu.
- **Windows Package Manager (WinGet)**:
  - Official Microsoft WinGet manifest ([`installer/windows/winget/dotmd.yaml`](file:///e:/md-visual/installer/windows/winget/dotmd.yaml)):
    ```cmd
    winget install dotmd
    ```

### macOS
- **Apple Disk Image (.dmg)**:
  - Industry standard `.dmg` volume. Double-click to open and drag `dot md.app` into `/Applications`.
  - Configured with `CFBundleDocumentTypes` for native Finder double-click handling of `.md`, `.markdown`, and `.mdown` files.
- **Homebrew Cask**:
  - Official Cask formula ([`installer/macos/homebrew/dotmd.rb`](file:///e:/md-visual/installer/macos/homebrew/dotmd.rb)):
    ```bash
    brew install --cask dotmd
    ```

### Linux (Ubuntu, Debian, Fedora, Arch)
- **Debian Package (.deb)**:
  - Standard package for Debian, Ubuntu, Mint, and Pop!_OS:
    ```bash
    sudo apt install ./dot-md_amd64.deb
    ```
  - Automatically installs `/usr/share/applications/dot-md.desktop`, hicolor SVG icon, and registers MIME database associations.
- **Universal AppImage**:
  - Standalone portable binary that runs on any Linux distribution with zero dependencies:
    ```bash
    chmod +x dot-md_amd64.AppImage
    ./dot-md_amd64.AppImage
    ```
- **XDG Desktop Standards**:
  - Freedesktop specification files located in [`installer/linux/`](file:///e:/md-visual/installer/linux/).

### Universal CLI (Any OS)
- **NPM Global Package**:
  ```bash
  npm install -g dotmd
  ```
- **Zero-Install Instant Run**:
  ```bash
  npx dotmd README.md
  ```

---

## Command-Line Usage

```bash
# Preview any markdown document
dotmd document.md

# Alternative alias
dot-md README.md

# Run directly without global installation
npx dotmd notes.md

# Export self-contained offline HTML
dotmd sample.md --export output.html

# Export headless publication-grade PDF via system Edge/Chrome
dotmd sample.md --pdf output.pdf

# Specify custom port
dotmd notes.md --port 4000

# Start server without automatically launching browser
dotmd notes.md --no-open

# Register or remove desktop integration
dotmd --install
dotmd --uninstall
```

### Options Reference

| Flag | Description |
| :--- | :--- |
| `<file.md>` | Path to the Markdown document to open (defaults to `sample.md` or `README.md`). |
| `--export [path]` | Exports a self-contained, offline HTML file and exits immediately. |
| `--pdf [path]` | Generates a publication-grade PDF headlessly via system Edge/Chrome and exits immediately. |
| `--port <number>` | Customizes local HTTP port (default: `3456`). Automatically falls back if port is occupied. |
| `--no-open` | Starts the live server without opening the application window or browser. |
| `--install` | Registers desktop entries, icons, and system file associations. |
| `--uninstall` | Unregisters desktop entries, file associations, and purges cache data. |
| `--help`, `-h` | Prints command-line usage information. |

---

## Keyboard Shortcuts

| Key | Context | Action |
| :--- | :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>F</kbd> or <kbd>/</kbd> | Global | Open In-Page Document Find / Quick Search |
| <kbd>Enter</kbd> / <kbd>Shift</kbd> + <kbd>Enter</kbd> | Search | Jump to next / previous search match |
| <kbd>T</kbd> | Global | Cycle Theme (Dark, Light, Sepia) |
| <kbd>Z</kbd> | Global | Toggle Zen Focus Mode |
| <kbd>W</kbd> | Global | Toggle Wide View Mode |
| <kbd>O</kbd> | Global | Toggle Table of Contents Outline Drawer |
| <kbd>R</kbd> | Global | Switch Visual Preview / Raw Markdown Editor |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | Editor | Save changes to disk |
| <kbd>Ctrl</kbd> + <kbd>V</kbd> | Editor | Paste image directly as self-contained Base64 URI |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>T</kbd> | Editor | Auto-align Markdown pipe table / Open Table Creator |
| <kbd>,</kbd> or <kbd>S</kbd> | Global | Open Application Settings |
| <kbd>P</kbd> or <kbd>Ctrl</kbd> + <kbd>P</kbd> | Global | Print or Export to PDF |
| <kbd>?</kbd> | Global | Open Keyboard Shortcuts Modal |
| <kbd>Esc</kbd> | Global | Close open modals, search bar, or exit Zen Mode |

---

## Building from Source

### Prerequisites
- Node.js (>= 16.0.0)
- Rust Toolchain (`cargo`, `rustc`) and C++ Build Tools
- Run `powershell scripts/setup-tauri.ps1` to automatically verify and install any missing build prerequisites on Windows.

### Development Mode
```bash
# Run Tauri desktop app in hot-reloading development mode
npm run tauri:dev

# Or launch local CLI preview server
npm start
```

### Production Release Build
```bash
# Build standalone packages and native installers (.msi/.exe on Windows, .dmg on macOS, .deb/.AppImage on Linux)
npm run build
```
Compiled artifacts and installers are written to `src-tauri/target/release/bundle/`.

### Run Automated Tests
```bash
npm test
```
Validates TOC extraction, table auto-alignment, print pagination rules, client scripts, platform installers, and Tauri configurations across 8 test suites.

---

## License

MIT License. Crafted for clean, distraction-free document authoring.

