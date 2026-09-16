# dot md - Industry Standard Installers & Packaging

`dot md` adheres strictly to standard, native operating system packaging and software distribution standards across Windows, macOS, and Linux.

---

## 1. Windows: MSI & NSIS Setup

Windows installations use Microsoft-compliant packaging toolchains:

| Format | Technology | Target | Deployment |
| :--- | :--- | :--- | :--- |
| **`.msi`** | **WiX Toolset** (Windows Installer XML) | Enterprise / System-Wide | Standard Windows Installer package. Supports Active Directory Group Policy (GPO) and silent mass deployments: <br>`msiexec /i dot-md_1.0.0_x64_en-US.msi /quiet /norestart` |
| **`.exe`** | **NSIS** (Nullsoft Scriptable Install System) | Desktop / User-Space | Standard interactive installer wizard with elevation prompts, desktop shortcuts, Start Menu integration, and clean Control Panel / Settings uninstallation. Supports silent installs: `dot-md_setup.exe /S` |
| **WinGet** | **Windows Package Manager** | CLI / Automated | Official Microsoft WinGet package manifest ([`installer/windows/winget/dotmd.yaml`](file:///e:/md-visual/installer/windows/winget/dotmd.yaml)). Install via: <br>`winget install dotmd` |

Build locally with Tauri v2:
```bash
npm run tauri:build
```
The resulting installers will be generated under `src-tauri/target/release/bundle/msi/` and `nsis/`.

---

## 2. macOS: Apple Disk Image (DMG) & Homebrew Cask

macOS software is packaged following Apple Human Interface and packaging conventions:

| Format | Technology | Target | Deployment |
| :--- | :--- | :--- | :--- |
| **`.dmg`** | **Apple Disk Image** | Interactive Desktop | Standard macOS installation experience. Double-click the `.dmg` file and drag the `dot md.app` bundle into your `/Applications` directory. Fully configured with `CFBundleDocumentTypes` and LaunchServices declarations for `.md` files. |
| **Cask** | **Homebrew** | Developer Package Manager | Standard Homebrew Cask formula ([`installer/macos/homebrew/dotmd.rb`](file:///e:/md-visual/installer/macos/homebrew/dotmd.rb)). Install via: <br>`brew install --cask dotmd` |

Build locally on macOS:
```bash
npm run tauri:build
```
The `.dmg` and `.app` bundle will be generated under `src-tauri/target/release/bundle/dmg/` and `macos/`.

---

## 3. Linux: Debian Package (DEB) & Universal AppImage

Linux packages conform to Debian policy and the Freedesktop.org XDG Desktop standards:

| Format | Technology | Target | Deployment |
| :--- | :--- | :--- | :--- |
| **`.deb`** | **Debian Binary Package** | Ubuntu / Debian / Mint / Pop!_OS | Native package with dependency resolution (`libwebkit2gtk-4.1-0`), Desktop Entry (`dot-md.desktop`), hicolor scalable icon, and MIME type hooks via `update-mime-database`. Install via: <br>`sudo apt install ./dot-md_1.0.0_amd64.deb` |
| **`.AppImage`** | **Universal Linux Portable** | Any Linux Distro | Single self-contained binary requiring zero root privileges. Mounts via FUSE, embeds all dependencies, and works immediately: <br>`chmod +x dot-md_1.0.0_amd64.AppImage && ./dot-md_1.0.0_amd64.AppImage` |
| **XDG** | **Freedesktop Standards** | System Integration | Specification files: [`installer/linux/dot-md.desktop`](file:///e:/md-visual/installer/linux/dot-md.desktop) and [`installer/linux/dot-md.xml`](file:///e:/md-visual/installer/linux/dot-md.xml). |

Build on Linux:
```bash
npm run tauri:build
```
Outputs are generated in `src-tauri/target/release/bundle/deb/` and `appimage/`.

---

## 4. Cross-Platform Developer CLI (NPM Registry)

For developers and command-line automation on any operating system:

```bash
# Install globally via standard NPM registry
npm install -g dotmd

# Or execute instantly without installation via npx
npx dotmd document.md
```
