# Original User Request

## 2026-09-15T13:19:11Z

This is a single self-contained fix; keep it small and focused.

Convert `dot md` from opening in external web browsers into a true standalone Windows desktop application window using a native C# / WebView2 host, maintaining sub-50ms live preview, publication-grade styling, and clean zero-terminal execution.

Working directory: e:\md-visual
Integrity mode: development

## Requirements

### R1. Native Windows Standalone Window
Replace external browser launching with a native Windows desktop window host:
- Embed Microsoft Edge WebView2 (native Windows 10/11 runtime) or equivalent lightweight C# desktop container into `dot-md.exe`.
- Launch directly into a dedicated application window with custom icon, menu/title bar, and no browser tabs or navigation/search bars.
- Retain the existing local Node.js rendering engine and HTTP/SSE live-reload pipeline.

### R2. Lifecycle & Process Management
- When the standalone window is closed by the user (or via Alt+F4 / Exit), the background Node.js process and any local server instances must immediately terminate cleanly with zero orphan processes.
- Startup must remain completely silent (zero flashing console/CMD windows).

### R3. Preserved Feature Parity
All existing features must function identically inside the standalone window:
- Real-time Markdown rendering with typography (Satoshi, Geist Mono), themes (Dark, Light, Sepia), KaTeX math, and Mermaid diagrams.
- Sticky Table of Contents, Zen mode (`Z`), Wide mode (`W`), and Visual/Raw split view (`R`).
- Standalone HTML export (`--export`) and PDF print.

### R4. Windows Installer & Uninstaller Integration
- Update `dot-md-setup.exe` to package and register the standalone native application as the default handler for `.md` files.
- Ensure `uninstall.exe` completely removes all registered components, shortcuts, and directories.

## Acceptance Criteria

### Standalone Window Experience
- [ ] Opening any `.md` file (via double-click, context menu, or CLI) opens in an independent native desktop window rather than the default browser.
- [ ] Window title displays `<filename> - dot md`.
- [ ] No black command/terminal window appears during launch or runtime.
- [ ] Closing the application window terminates the Node server and background process within 1 second with 0 zombie processes.

### Feature & Build Integrity
- [ ] Live reload continues to update content dynamically upon saving changes to the active Markdown file.
- [ ] All keyboard shortcuts (T, Z, W, R, P) work inside the standalone window.
- [ ] `npm test` runs and passes all integrity checks.
- [ ] `npm run build` compiles `dot-md.exe`, `dot-md-setup.exe`, and `uninstall.exe` with exit code 0.
