# Changelog

All notable changes to **dot md** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-19

### Added
- **Native Zero-Console Launcher (`bin/dotmd.exe`)**: Windows GUI subsystem executable that launches without opening any command prompt window.
- **Publication-Grade Typography**: Satoshi (display) + Geist Mono / system sans typography with sub-pixel alignment.
- **Real-Time Live Reload & In-Place Editing**: Instant SSE synchronization between filesystem and viewport with <kbd>Ctrl+S</kbd> disk persistence.
- **Sticky Table of Contents (Outline)**: Pinned left sidebar with smooth active heading detection and bounded scrollbar behavior.
- **Mermaid Lossless Pan & Zoom**: Interactive vector inspection for architectural and flow diagrams.
- **KaTeX & Math Rendering**: Full support for inline `$...$` and block `$$...$$` equations.
- **Reading Themes**: Dark, Light, and Sepia themes with CSS custom property tinting.
- **Focus Modes**: Zen focus mode (<kbd>Z</kbd>), Wide view (<kbd>W</kbd>), and Split/Raw Markdown mode (<kbd>R</kbd>).
- **Standalone Exports**: Self-contained HTML bundle (`--export`) and publication-grade headless PDF generation (`--pdf`).
- **Cross-Platform OS Integration**:
  - Windows: Explorer context menu, `.md` file associations, Add/Remove programs registry integration.
  - macOS: Application bundle structure, LaunchServices registration, Homebrew formula.
  - Linux: Freedesktop `.desktop` launcher, MIME-type association, XDG desktop database integration.
