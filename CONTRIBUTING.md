# Contributing to dot md

Thank you for your interest in contributing to **dot md**! We welcome bug reports, improvements, documentation updates, and feature suggestions.

---

## Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/dotmd.git
   cd dotmd
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development test suite:**
   ```bash
   npm test
   ```

4. **Launch with sample document:**
   ```bash
   npm start
   # or: node bin/cli.js sample.md
   ```

---

## Architecture Overview

- **`bin/cli.js`**: Universal Node.js CLI runtime, HTTP server, SSE live-reload hub, and export engine.
- **`bin/dotmd.exe`**: Native Windows GUI launcher compiled via `scripts/build-launcher.ps1` to suppress console windows.
- **`lib/template.js`**: Core HTML/CSS template compiler, client-side GFM parser, typography, and interactive components.
- **`lib/platform-installer.js`**: Native OS desktop integration (Windows Registry, macOS LaunchServices, Linux Freedesktop).
- **`scripts/generate-shell.js`**: Pre-compiles `template.html` and `dist/index.html` from `lib/template.js`.

---

## Submitting Pull Requests

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your modifications following the existing formatting and conventions.
3. Run the automated test suite to ensure all assertions pass:
   ```bash
   npm test
   ```
4. If you modified `lib/template.js`, regenerate the shell:
   ```bash
   npm run generate:shell
   ```
5. Commit your changes with a conventional commit message (`feat:`, `fix:`, `docs:`, `chore:`).
6. Push to your fork and submit a Pull Request.
