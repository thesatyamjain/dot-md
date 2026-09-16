#!/usr/bin/env node

const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
const { exec, execSync, spawn } = require('child_process');
const { renderTemplate } = require('../lib/template');

const args = process.argv.slice(2);

// Display help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  \x1b[1m\x1b[38;2;223;112;60mdot md\x1b[0m - Turn Markdown into publication-grade documents (Windows, macOS, Linux)

  \x1b[1mUSAGE\x1b[0m
    dotmd <file.md> [options]
    dot-md <file.md> [options]
    npx dotmd <file.md> [options]

  \x1b[1mOPTIONS\x1b[0m
    --export [path]    Export standalone, offline HTML file and exit
    --pdf [path]       Export publication-grade PDF document and exit
    --port <number>    Set local server port (default: 3456)
    --no-open          Do not automatically open the window or browser
    --install          Register desktop shortcuts, app icon, and file associations
    --uninstall        Remove desktop integration, associations, and cache
    --help, -h         Show this help message

  \x1b[1mEXAMPLES\x1b[0m
    dotmd README.md
    dotmd notes.md --export output.html
    dotmd architecture.md --port 4000
    dotmd --install
  `);
  process.exit(0);
}

// Handle desktop installation
if (args.includes('--install')) {
  const { installCurrentPlatform } = require('../lib/platform-installer');
  console.log('\n\x1b[1m\x1b[38;2;223;112;60mdot md\x1b[0m - Registering platform desktop integration...');
  installCurrentPlatform({ silent: false })
    .then(() => {
      console.log('\x1b[32m✔ Installation completed successfully.\x1b[0m\n');
      process.exit(0);
    })
    .catch(err => {
      console.error(`\x1b[31mError during installation: ${err.message}\x1b[0m\n`);
      process.exit(1);
    });
  return;
}

// Handle desktop uninstallation
if (args.includes('--uninstall')) {
  const { uninstallCurrentPlatform } = require('../lib/platform-installer');
  console.log('\n\x1b[1m\x1b[38;2;223;112;60mdot md\x1b[0m - Removing platform desktop integration...');
  uninstallCurrentPlatform({ silent: false, purgeCache: true })
    .then(() => {
      console.log('\x1b[32m✔ Uninstallation completed successfully.\x1b[0m\n');
      process.exit(0);
    })
    .catch(err => {
      console.error(`\x1b[31mError during uninstallation: ${err.message}\x1b[0m\n`);
      process.exit(1);
    });
  return;
}

// Parse flags
let filePath = null;
let exportPath = null;
let pdfPath = null;
let port = 3456;
let autoOpen = true;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--port' && args[i + 1]) {
    port = parseInt(args[++i], 10) || 3456;
  } else if (arg === '--export') {
    if (args[i + 1] && !args[i + 1].startsWith('-')) {
      exportPath = args[++i];
    } else {
      exportPath = true;
    }
  } else if (arg === '--pdf') {
    if (args[i + 1] && !args[i + 1].startsWith('-')) {
      pdfPath = args[++i];
    } else {
      pdfPath = true;
    }
  } else if (arg === '--no-open') {
    autoOpen = false;
  } else if (!arg.startsWith('-') && !filePath) {
    filePath = arg;
  }
}

// Default to sample.md or README.md if no file specified
if (!filePath) {
  if (fs.existsSync(path.resolve(process.cwd(), 'sample.md'))) {
    filePath = 'sample.md';
  } else if (fs.existsSync(path.resolve(process.cwd(), 'README.md'))) {
    filePath = 'README.md';
  } else {
    console.error('\x1b[31mError: Please provide a markdown file to view (e.g. md-visual README.md)\x1b[0m');
    process.exit(1);
  }
}

const resolvedPath = path.resolve(process.cwd(), filePath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`\x1b[31mError: File not found at ${resolvedPath}\x1b[0m`);
  process.exit(1);
}

const filename = path.basename(resolvedPath);

// Handle Export HTML Mode
if (exportPath) {
  const finalExportPath = typeof exportPath === 'string'
    ? path.resolve(process.cwd(), exportPath)
    : path.resolve(process.cwd(), `${path.parse(filename).name}.html`);

  const markdown = fs.readFileSync(resolvedPath, 'utf8');
  const html = renderTemplate({
    markdown,
    filename,
    isLive: false,
  });

  fs.writeFileSync(finalExportPath, html, 'utf8');
  console.log(`\n\x1b[32m✔ Standalone document exported successfully:\x1b[0m`);
  console.log(`  \x1b[1m${finalExportPath}\x1b[0m\n`);
  process.exit(0);
}

// Handle PDF Export Mode
if (pdfPath) {
  const finalPdfPath = typeof pdfPath === 'string'
    ? path.resolve(process.cwd(), pdfPath)
    : path.resolve(process.cwd(), `${path.parse(filename).name}.pdf`);

  const markdown = fs.readFileSync(resolvedPath, 'utf8');
  const html = renderTemplate({
    markdown,
    filename,
    isLive: false,
  });

  const tempHtmlPath = path.resolve(process.cwd(), `.dotmd-temp-${Date.now()}.html`);
  fs.writeFileSync(tempHtmlPath, html, 'utf8');

  // Find Chrome/Edge binary
  let browserBin = null;
  if (process.platform === 'win32') {
    const candidates = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];
    browserBin = candidates.find(c => fs.existsSync(c));
  } else if (process.platform === 'darwin') {
    const candidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
    ];
    browserBin = candidates.find(c => fs.existsSync(c));
  } else {
    const candidates = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge'];
    for (const b of candidates) {
      try {
        execSync(`command -v ${b} 2>/dev/null`);
        browserBin = b;
        break;
      } catch (_) {}
    }
  }

  if (!browserBin) {
    console.error('\x1b[31mError: A Chromium-based browser (Edge, Chrome, Chromium) is required for headless PDF generation.\x1b[0m');
    if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    process.exit(1);
  }

  const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
  try {
    execSync(`"${browserBin}" --headless --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${finalPdfPath}" "${fileUrl}"`, { stdio: 'pipe' });
    if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    console.log(`\n\x1b[32m✔ Publication-grade PDF exported successfully:\x1b[0m`);
    console.log(`  \x1b[1m${finalPdfPath}\x1b[0m\n`);
    process.exit(0);
  } catch (err) {
    if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    console.error(`\x1b[31mError generating PDF: ${err.message}\x1b[0m`);
    process.exit(1);
  }
}

// Live Server Mode with Intelligent Auto-Shutdown
const sseClients = new Set();
let shutdownTimer = null;
let hasConnected = false;

function scheduleAutoShutdown(delayMs = 5000) {
  if (shutdownTimer) clearTimeout(shutdownTimer);
  if (hasConnected && sseClients.size === 0) {
    shutdownTimer = setTimeout(() => {
      if (sseClients.size === 0) {
        process.exit(0);
      }
    }, delayMs);
  }
}

function cancelAutoShutdown() {
  if (shutdownTimer) {
    clearTimeout(shutdownTimer);
    shutdownTimer = null;
  }
}

// Initial safety timeout: if browser is never opened within 45 seconds, exit cleanly
setTimeout(() => {
  if (!hasConnected && sseClients.size === 0) {
    process.exit(0);
  }
}, 45000);

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);

  if (url.pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('data: connected\n\n');
    
    hasConnected = true;
    cancelAutoShutdown();
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
      scheduleAutoShutdown();
    });
    return;
  }

  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7.5" fill="#df703c"/><path d="M6.5 21.5V10.5L11.75 15.75L17 10.5V21.5" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 10.5V20.5M19.5 17.5L23 21L26.5 17.5" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  if (url.pathname === '/favicon.ico') {
    const icoPath = path.resolve(__dirname, '..', 'favicon.ico');
    if (fs.existsSync(icoPath)) {
      res.writeHead(200, { 'Content-Type': 'image/x-icon', 'Cache-Control': 'public, max-age=86400' });
      res.end(fs.readFileSync(icoPath));
      return;
    }
    res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' });
    res.end(faviconSvg);
    return;
  }

  if (url.pathname === '/favicon.svg') {
    res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' });
    res.end(faviconSvg);
    return;
  }

  if (url.pathname === '/manifest.json') {
    const manifest = {
      name: "md-visual",
      short_name: "md-visual",
      start_url: "/",
      display: "standalone",
      background_color: "#0e1117",
      theme_color: "#0e1117",
      description: "Visual Markdown Viewer & Exporter",
      icons: [
        {
          src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='7.5' fill='%23df703c'/><path d='M6.5 21.5V10.5L11.75 15.75L17 10.5V21.5' fill='none' stroke='%23ffffff' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/><path d='M23 10.5V20.5M19.5 17.5L23 21L26.5 17.5' fill='none' stroke='%23ffffff' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/></svg>",
          sizes: "any",
          type: "image/svg+xml"
        }
      ]
    };
    res.writeHead(200, { 'Content-Type': 'application/manifest+json; charset=utf-8' });
    res.end(JSON.stringify(manifest));
    return;
  }

  if (url.pathname === '/') {
    try {
      const markdown = fs.readFileSync(resolvedPath, 'utf8');
      const html = renderTemplate({
        markdown,
        filename,
        isLive: true,
        livePort: port,
      });

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Internal Server Error: ${err.message}`);
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (typeof parsed.markdown === 'string') {
          isInternalSave = true;
          fs.writeFileSync(resolvedPath, parsed.markdown, 'utf8');
          setTimeout(() => { isInternalSave = false; }, 300);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, savedAt: new Date().toISOString() }));
          return;
        }
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing markdown parameter' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Watch for file modifications with debouncing
let isInternalSave = false;
let debounceTimer = null;
fs.watch(resolvedPath, (eventType) => {
  if (isInternalSave) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`\x1b[38;2;223;112;60m[live-reload]\x1b[0m ${filename} updated -> refreshing browser...`);
    for (const client of sseClients) {
      client.write('data: reload\n\n');
    }
  }, 60);
});

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          resolve(findAvailablePort(startPort + 1));
        } else {
          resolve(startPort);
        }
      })
      .once('listening', () => {
        tester.once('close', () => resolve(startPort)).close();
      })
      .listen(startPort);
  });
}

function launchWindowOrBrowser(url, targetFilePath) {
  // 1. Check for standalone Tauri application binary if compiled
  const tauriReleaseExe = process.platform === 'win32'
    ? path.resolve(__dirname, '..', 'src-tauri', 'target', 'release', 'dot-md.exe')
    : path.resolve(__dirname, '..', 'src-tauri', 'target', 'release', 'dot-md');

  if (fs.existsSync(tauriReleaseExe)) {
    const child = spawn(tauriReleaseExe, [targetFilePath], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();
    process.exit(0);
    return;
  }

  // 2. Windows: Launch dedicated chromeless window or system browser
  if (process.platform === 'win32') {
    const winBrowsers = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ];
    for (const browserPath of winBrowsers) {
      if (fs.existsSync(browserPath)) {
        const child = spawn(browserPath, [`--app=${url}`, '--new-window'], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        return;
      }
    }
    exec(`cmd /c start "" "${url}"`);
    return;
  }

  // 2. macOS & Linux: Attempt chromeless standalone application window via Chromium
  const isMac = process.platform === 'darwin';
  const candidates = isMac
    ? [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
      ]
    : [
        'google-chrome',
        'google-chrome-stable',
        'chromium',
        'chromium-browser',
        'brave-browser',
        'brave',
        'microsoft-edge',
        'microsoft-edge-stable'
      ];

  for (const bin of candidates) {
    try {
      let available = false;
      if (isMac) {
        available = fs.existsSync(bin);
      } else {
        try {
          execSync(`command -v ${bin} 2>/dev/null`);
          available = true;
        } catch (_) {
          available = false;
        }
      }

      if (available) {
        const child = spawn(bin, [`--app=${url}`, '--new-window'], {
          detached: true,
          stdio: 'ignore'
        });
        child.unref();
        return;
      }
    } catch (_) {}
  }

  // 3. Fallback to default system browser
  if (isMac) {
    exec(`open "${url}"`);
  } else {
    exec(`xdg-open "${url}"`);
  }
}

(async () => {
  const openPort = await findAvailablePort(port);
  if (openPort !== port) {
    console.log(`\x1b[33m[info]\x1b[0m Port ${port} is in use; automatically using port ${openPort}.`);
    port = openPort;
  }

  server.on('error', (err) => {
    console.error(`\x1b[31m[error] Server error: ${err.message}\x1b[0m`);
    process.exit(1);
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;

    // If launched by native app host, just emit the port on stdout and skip browser
    if (args.includes('--app-window')) {
      process.stdout.write(`DOTMD_PORT=${port}\n`);
      return;
    }

    console.log(`
  \x1b[1m\x1b[38;2;223;112;60mdot md\x1b[0m running at \x1b[4m${url}\x1b[0m
  Watching \x1b[1m${filename}\x1b[0m for live changes.
  
  \x1b[90mShortcuts in browser:\x1b[0m
  - \x1b[1mT\x1b[0m : Switch themes (Dark / Light / Sepia)
  - \x1b[1mZ\x1b[0m : Zen focus mode
  - \x1b[1mW\x1b[0m : Toggle Wide view
  - \x1b[1mR\x1b[0m : Switch Visual / Raw Markdown
  - \x1b[1mP\x1b[0m : Print / Export to PDF
  - \x1b[1m?\x1b[0m : Show all shortcuts
  - \x1b[90mCtrl+C to stop the server\x1b[0m
  `);

    if (autoOpen) {
      launchWindowOrBrowser(url, resolvedPath);
    }
  });
})();
