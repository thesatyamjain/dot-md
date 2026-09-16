const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');

function getRootDir() {
  return path.resolve(__dirname, '..');
}

/**
 * Generate Freedesktop .desktop entry content for Linux
 */
function getLinuxDesktopFile(cliPath, iconPath) {
  return `[Desktop Entry]
Version=1.0
Type=Application
Name=dot md
GenericName=Markdown Editor & Viewer
Comment=Publication-grade Markdown editor and standalone viewer
Exec=${cliPath} %F
Icon=${iconPath || 'dot-md'}
Terminal=false
MimeType=text/markdown;text/x-markdown;text/plain;
Categories=Utility;TextEditor;Office;
Keywords=markdown;editor;viewer;preview;
StartupWMClass=dot md
Actions=Preview;

[Desktop Action Preview]
Name=Preview with dot md
Exec=${cliPath} %F
`;
}

/**
 * Generate macOS Info.plist content
 */
function getMacosInfoPlist() {
  return `<?xml version="1.0" encoding="UTF-8"?>
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
`;
}

/**
 * Install dot md on Linux desktop
 */
function installLinux({ silent = false } = {}) {
  const log = silent ? () => {} : console.log;
  const rootDir = getRootDir();
  const homeDir = os.homedir();

  const dataHome = process.env.XDG_DATA_HOME || path.join(homeDir, '.local', 'share');
  const appsDir = path.join(dataHome, 'applications');
  const iconsDir = path.join(dataHome, 'icons', 'hicolor', 'scalable', 'apps');

  fs.mkdirSync(appsDir, { recursive: true });
  fs.mkdirSync(iconsDir, { recursive: true });

  // 1. Install Icon
  const srcSvg = path.join(rootDir, 'favicon.svg');
  const targetSvg = path.join(iconsDir, 'dot-md.svg');
  if (fs.existsSync(srcSvg)) {
    fs.copyFileSync(srcSvg, targetSvg);
    log(`  \x1b[32m✔\x1b[0m Installed application icon: ${targetSvg}`);
  }

  // 2. Install Desktop Entry
  const cliPath = 'dotmd';
  const desktopContent = getLinuxDesktopFile(cliPath, 'dot-md');
  const desktopFilePath = path.join(appsDir, 'dot-md.desktop');
  fs.writeFileSync(desktopFilePath, desktopContent, 'utf8');
  try { fs.chmodSync(desktopFilePath, 0o755); } catch (_) {}
  log(`  \x1b[32m✔\x1b[0m Registered desktop entry: ${desktopFilePath}`);

  // 3. Update desktop database & MIME defaults
  try {
    execSync(`update-desktop-database "${appsDir}" 2>/dev/null || true`);
  } catch (_) {}

  try {
    execSync(`xdg-mime default dot-md.desktop text/markdown text/x-markdown 2>/dev/null || true`);
    log(`  \x1b[32m✔\x1b[0m Associated MIME types (text/markdown, text/x-markdown) with dot md`);
  } catch (_) {}

  return { ok: true, desktopFile: desktopFilePath, iconFile: targetSvg };
}

/**
 * Uninstall dot md from Linux desktop
 */
function uninstallLinux({ silent = false, purgeCache = true } = {}) {
  const log = silent ? () => {} : console.log;
  const homeDir = os.homedir();
  const dataHome = process.env.XDG_DATA_HOME || path.join(homeDir, '.local', 'share');
  const appsDir = path.join(dataHome, 'applications');
  const desktopFilePath = path.join(appsDir, 'dot-md.desktop');
  const iconPath = path.join(dataHome, 'icons', 'hicolor', 'scalable', 'apps', 'dot-md.svg');

  if (fs.existsSync(desktopFilePath)) {
    fs.unlinkSync(desktopFilePath);
    log(`  \x1b[32m✔\x1b[0m Removed desktop entry: ${desktopFilePath}`);
  }
  if (fs.existsSync(iconPath)) {
    fs.unlinkSync(iconPath);
    log(`  \x1b[32m✔\x1b[0m Removed icon: ${iconPath}`);
  }

  try {
    execSync(`update-desktop-database "${appsDir}" 2>/dev/null || true`);
  } catch (_) {}

  if (purgeCache) {
    const cacheDir = path.join(homeDir, '.cache', 'dot-md');
    const configDir = path.join(homeDir, '.config', 'dot-md');
    if (fs.existsSync(cacheDir)) fs.rmSync(cacheDir, { recursive: true, force: true });
    if (fs.existsSync(configDir)) fs.rmSync(configDir, { recursive: true, force: true });
    log(`  \x1b[32m✔\x1b[0m Purged cache and configuration data`);
  }

  return { ok: true };
}

/**
 * Install dot md on macOS
 */
function installMacos({ silent = false } = {}) {
  const log = silent ? () => {} : console.log;
  const rootDir = getRootDir();
  const homeDir = os.homedir();

  const userAppsDir = path.join(homeDir, 'Applications');
  const appPath = path.join(userAppsDir, 'dot md.app');
  const contentsDir = path.join(appPath, 'Contents');
  const macosDir = path.join(contentsDir, 'MacOS');
  const resDir = path.join(contentsDir, 'Resources');

  fs.mkdirSync(macosDir, { recursive: true });
  fs.mkdirSync(resDir, { recursive: true });

  // 1. Write Info.plist
  fs.writeFileSync(path.join(contentsDir, 'Info.plist'), getMacosInfoPlist(), 'utf8');

  // 2. Write launcher script
  const launcherScript = `#!/bin/sh
if command -v dotmd >/dev/null 2>&1; then
  exec dotmd "$@"
elif [ -f "/usr/local/bin/dotmd" ]; then
  exec "/usr/local/bin/dotmd" "$@"
elif [ -f "$HOME/.local/bin/dotmd" ]; then
  exec "$HOME/.local/bin/dotmd" "$@"
else
  exec node "${path.join(rootDir, 'bin', 'cli.js')}" "$@"
fi
`;
  const launcherPath = path.join(macosDir, 'dot-md');
  fs.writeFileSync(launcherPath, launcherScript, 'utf8');
  try { fs.chmodSync(launcherPath, 0o755); } catch (_) {}

  // 3. Copy Icon
  const srcIcon = path.join(rootDir, 'favicon.ico');
  if (fs.existsSync(srcIcon)) {
    fs.copyFileSync(srcIcon, path.join(resDir, 'AppIcon.icns'));
  }

  // 4. Register with macOS LaunchServices
  const lsregister = '/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister';
  if (fs.existsSync(lsregister)) {
    try {
      execSync(`"${lsregister}" -f "${appPath}"`);
      log(`  \x1b[32m✔\x1b[0m Registered file associations with macOS LaunchServices`);
    } catch (_) {}
  }

  log(`  \x1b[32m✔\x1b[0m Created macOS Application: ${appPath}`);
  return { ok: true, appPath };
}

/**
 * Uninstall dot md from macOS
 */
function uninstallMacos({ silent = false, purgeCache = true } = {}) {
  const log = silent ? () => {} : console.log;
  const homeDir = os.homedir();
  const appPath = path.join(homeDir, 'Applications', 'dot md.app');

  if (fs.existsSync(appPath)) {
    fs.rmSync(appPath, { recursive: true, force: true });
    log(`  \x1b[32m✔\x1b[0m Removed macOS Application bundle: ${appPath}`);
  }

  const lsregister = '/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister';
  if (fs.existsSync(lsregister)) {
    try {
      execSync(`"${lsregister}" -u "${appPath}" 2>/dev/null || true`);
    } catch (_) {}
  }

  if (purgeCache) {
    const cacheDir = path.join(homeDir, 'Library', 'Caches', 'dot-md');
    const appSupport = path.join(homeDir, 'Library', 'Application Support', 'dot-md');
    if (fs.existsSync(cacheDir)) fs.rmSync(cacheDir, { recursive: true, force: true });
    if (fs.existsSync(appSupport)) fs.rmSync(appSupport, { recursive: true, force: true });
    log(`  \x1b[32m✔\x1b[0m Purged cache and application support data`);
  }

  return { ok: true };
}

/**
 * Install dot md on Windows (Registry file associations & context menu, or Tauri bundle)
 */
function installWindows({ silent = false } = {}) {
  const log = silent ? () => {} : console.log;
  const rootDir = getRootDir();

  // 1. Check if a compiled Tauri installer exists
  const tauriBundleDir = path.join(rootDir, 'src-tauri', 'target', 'release', 'bundle');
  const nsisDir = path.join(tauriBundleDir, 'nsis');
  const msiDir = path.join(tauriBundleDir, 'msi');

  let installerExe = null;
  if (fs.existsSync(nsisDir)) {
    const files = fs.readdirSync(nsisDir).filter(f => f.endsWith('.exe'));
    if (files.length > 0) installerExe = path.join(nsisDir, files[0]);
  }
  if (!installerExe && fs.existsSync(msiDir)) {
    const files = fs.readdirSync(msiDir).filter(f => f.endsWith('.msi'));
    if (files.length > 0) installerExe = path.join(msiDir, files[0]);
  }

  if (installerExe) {
    log(`  Found compiled native installer: ${installerExe}`);
    const args = silent ? ['/S'] : [];
    const child = spawn(installerExe, args, { stdio: silent ? 'ignore' : 'inherit' });
    return new Promise((resolve, reject) => {
      child.on('close', code => {
        if (code === 0) resolve({ ok: true });
        else reject(new Error(`Installer exited with code ${code}`));
      });
    });
  }

  // 2. Direct Windows Registry Integration (Zero compilation needed)
  try {
    const iconPath = path.join(rootDir, 'favicon.ico');
    const cliPath = path.join(rootDir, 'bin', 'cli.js');
    const nodeExe = process.execPath;
    const commandStr = `\\"${nodeExe}\\" \\"${cliPath}\\" \\"%1\\"`;

    // Associate .md and .markdown
    execSync(`reg add "HKCU\\Software\\Classes\\.md" /ve /d "dotmd.document" /f`, { stdio: 'ignore' });
    execSync(`reg add "HKCU\\Software\\Classes\\.markdown" /ve /d "dotmd.document" /f`, { stdio: 'ignore' });
    execSync(`reg add "HKCU\\Software\\Classes\\dotmd.document" /ve /d "Markdown Document" /f`, { stdio: 'ignore' });

    if (fs.existsSync(iconPath)) {
      execSync(`reg add "HKCU\\Software\\Classes\\dotmd.document\\DefaultIcon" /ve /d "${iconPath}" /f`, { stdio: 'ignore' });
    }

    execSync(`reg add "HKCU\\Software\\Classes\\dotmd.document\\shell\\open\\command" /ve /d "${commandStr}" /f`, { stdio: 'ignore' });

    // Context Menu: "Open with dot md"
    execSync(`reg add "HKCU\\Software\\Classes\\*\\shell\\OpenWithDotMd" /ve /d "Open with dot md" /f`, { stdio: 'ignore' });
    if (fs.existsSync(iconPath)) {
      execSync(`reg add "HKCU\\Software\\Classes\\*\\shell\\OpenWithDotMd" /v "Icon" /d "${iconPath}" /f`, { stdio: 'ignore' });
    }
    execSync(`reg add "HKCU\\Software\\Classes\\*\\shell\\OpenWithDotMd\\command" /ve /d "${commandStr}" /f`, { stdio: 'ignore' });

    log(`  \x1b[32m✔\x1b[0m Registered .md and .markdown file associations in Windows Registry`);
    log(`  \x1b[32m✔\x1b[0m Added "Open with dot md" right-click context menu`);
    if (fs.existsSync(iconPath)) {
      log(`  \x1b[32m✔\x1b[0m Set default application icon to: ${iconPath}`);
    }

    return Promise.resolve({ ok: true });
  } catch (err) {
    return Promise.reject(err);
  }
}

/**
 * Uninstall dot md from Windows
 */
function uninstallWindows({ silent = false } = {}) {
  const log = silent ? () => {} : console.log;

  try {
    execSync(`reg delete "HKCU\\Software\\Classes\\.md" /f`, { stdio: 'ignore' });
  } catch (_) {}
  try {
    execSync(`reg delete "HKCU\\Software\\Classes\\.markdown" /f`, { stdio: 'ignore' });
  } catch (_) {}
  try {
    execSync(`reg delete "HKCU\\Software\\Classes\\dotmd.document" /f`, { stdio: 'ignore' });
  } catch (_) {}
  try {
    execSync(`reg delete "HKCU\\Software\\Classes\\*\\shell\\OpenWithDotMd" /f`, { stdio: 'ignore' });
  } catch (_) {}

  log(`  \x1b[32m✔\x1b[0m Cleaned Windows Registry file associations and context menu entries`);
  return Promise.resolve({ ok: true });
}

/**
 * Universal Platform Install Entrypoint
 */
async function installCurrentPlatform(options = {}) {
  const platform = process.platform;
  if (platform === 'linux') {
    return installLinux(options);
  } else if (platform === 'darwin') {
    return installMacos(options);
  } else if (platform === 'win32') {
    return await installWindows(options);
  } else {
    throw new Error(`Unsupported operating system: ${platform}`);
  }
}

/**
 * Universal Platform Uninstall Entrypoint
 */
async function uninstallCurrentPlatform(options = {}) {
  const platform = process.platform;
  if (platform === 'linux') {
    return uninstallLinux(options);
  } else if (platform === 'darwin') {
    return uninstallMacos(options);
  } else if (platform === 'win32') {
    return await uninstallWindows(options);
  } else {
    throw new Error(`Unsupported operating system: ${platform}`);
  }
}

module.exports = {
  getLinuxDesktopFile,
  getMacosInfoPlist,
  installLinux,
  uninstallLinux,
  installMacos,
  uninstallMacos,
  installWindows,
  uninstallWindows,
  installCurrentPlatform,
  uninstallCurrentPlatform,
};
