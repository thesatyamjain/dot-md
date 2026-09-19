const assert = require('assert');
const vm = require('vm');
const { renderTemplate } = require('../lib/template');

// Test: Code blocks with comments must NOT leak into the Outline (TOC)
const markdownWithCode = [
  '# Resilient Systems',
  '## Implementation Patterns',
  '```python',
  '# This is a Python comment that must NOT appear in outline',
  '## Another comment with double hashes',
  'def connect_db():',
  '    # step 1: initialize',
  '    pass',
  '```',
  '```bash',
  '# Install dependencies',
  'npm install',
  '```',
  '## Using `AtomicRateLimiter` in Production',
  'Some text here.'
].join('\n');

const html = renderTemplate({ markdown: markdownWithCode });

// Extract the Outline nav HTML
const tocNav = html.substring(html.indexOf('<nav class="toc-nav">'), html.indexOf('</nav>'));

// Verify that the outline does not contain code comments
assert(!tocNav.includes('data-slug="this-is-a-python-comment"'), 'Python comment leaked into outline slug');
assert(!tocNav.includes('This is a Python comment'), 'Python comment text leaked into outline');
assert(!tocNav.includes('Another comment with double hashes'), 'Double hash comment leaked into outline');
assert(!tocNav.includes('Install dependencies'), 'Bash comment leaked into outline');

// Verify that real headings are present
assert(html.includes('data-slug="resilient-systems"'), 'Main heading missing from outline');
assert(html.includes('data-slug="implementation-patterns"'), 'H2 heading missing from outline');
assert(html.includes('data-slug="using-atomicratelimiter-in-production"'), 'H2 with inline code missing from outline');
assert(html.includes('Using <code>AtomicRateLimiter</code> in Production'), 'Inline code inside heading not rendered properly');

// Verify Zen mode CSS integrity (legacy alias for outline collapse)
assert(html.includes('body.zen-mode .toc-sidebar'), 'Zen mode sidebar CSS missing');
assert(html.includes('width: 0 !important'), 'Zen mode 0-width collapse missing');
assert(html.includes('body.zen-mode .app-layout'), 'Zen mode layout CSS missing');
// Verify Wide mode integrity
assert(html.includes('id="wide-btn"'), 'Wide view button missing from header');
assert(html.includes('body.wide-mode'), 'Wide mode CSS missing');
assert(html.includes('--content-max: 1440px'), 'Wide mode max-width missing');
assert(html.includes('toggleWide'), 'toggleWide script missing');

// Verify Visual / Raw mode integrity
assert(html.includes('id="view-visual-btn"'), 'Visual view button missing');
assert(html.includes('id="view-raw-btn"'), 'Raw view button missing');
assert(html.includes('id="raw-view"'), 'Raw view container missing');
assert(html.includes('id="raw-markdown-code"'), 'Raw markdown code block missing');
assert(html.includes('setViewMode'), 'setViewMode script missing');

// Verify Raw Viewer IDE-grade features
assert(html.includes('class="raw-line-numbers"'), 'Raw line numbers gutter missing');
assert(html.includes('class="raw-line"'), 'Raw line spans missing');
assert(html.includes('id="raw-wrap-btn"'), 'Raw wrap toggle button missing');
assert(html.includes('.raw-view-container.wrap-mode'), 'Wrap mode CSS missing');
assert(html.includes('syncRawLineHeights'), 'syncRawLineHeights script missing');
assert(html.includes('toggleRawWrap'), 'toggleRawWrap script missing');
assert(html.includes('downloadRawMarkdown'), 'downloadRawMarkdown script missing');
assert(html.includes('class="raw-file-badge"'), 'Raw file badge missing');

// Verify Frictionless View vs Edit Anchor Synchronization (No Jumping Cursor)
assert(html.includes('getVisualScrollAnchor'), 'getVisualScrollAnchor function missing');
assert(html.includes('scrollRawToAnchor'), 'scrollRawToAnchor function missing');
assert(html.includes('getRawScrollAnchor'), 'getRawScrollAnchor function missing');
assert(html.includes('scrollVisualToAnchor'), 'scrollVisualToAnchor function missing');

// Verify Logo & Favicon integrity
assert(html.includes('rel="icon"'), 'Favicon link missing from head');
assert(html.includes('rel="alternate icon"'), 'Alternate favicon.ico link missing from head');
assert(html.includes('type="image/svg+xml"'), 'SVG Favicon type missing');
assert(html.includes('class="header-brand"'), 'Header brand link missing');
assert(html.includes('class="brand-logo"'), 'Brand logo container missing');
assert(html.includes('class="brand-name"'), 'Brand name text missing');

// Verify UI Button Icons and SVG Geometry
assert(html.includes('id="view-visual-btn"') && html.includes('<span>Visual</span>'), 'Visual view button structure missing');
assert(html.includes('id="view-raw-btn"') && html.includes('<span>Raw</span>'), 'Raw view button structure missing');
assert(html.includes('title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts"><svg'), 'Keyboard shortcuts button missing SVG icon');
assert(html.includes('.icon-btn svg'), 'icon-btn svg sizing CSS missing');
assert(html.includes('.tool-btn svg'), 'tool-btn svg sizing CSS missing');
assert(html.includes('aria-label="Close shortcuts"><svg'), 'Shortcuts close button missing SVG icon');
assert(html.includes('aria-label="Close Settings"><svg'), 'Settings close button missing SVG icon');
assert(html.includes('aria-label="Close Table Tools"><svg'), 'Table modal close button missing SVG icon');

// Verify Outline UX and toggle features
assert(html.includes('id="toc-toggle-btn"'), 'Outline toggle button missing from header');
assert(html.includes('toggleOutline'), 'toggleOutline function missing');
assert(html.includes('class="toc-badge"'), 'Section count badge missing from outline');
assert(html.includes('body.outline-collapsed'), 'Outline collapsed CSS missing');

// Verify App Settings System
assert(html.includes('id="settings-btn"'), 'Settings button missing from header');
assert(html.includes('id="settings-modal"'), 'Settings modal container missing');
assert(html.includes('toggleSettingsModal'), 'toggleSettingsModal script missing');
assert(html.includes('applySettings'), 'applySettings script missing');
assert(html.includes('DEFAULT_SETTINGS'), 'DEFAULT_SETTINGS object missing');
assert(html.includes('id="setting-theme-control"'), 'Theme control missing in settings modal');
assert(html.includes('id="setting-font-family-control"'), 'Font family control missing in settings modal');
assert(html.includes('id="setting-width-control"'), 'Width control missing in settings modal');

// Verify Editor Engine, Toolbar, Shortcuts and In-Place Editing
assert(html.includes('id="toggle-edit-btn"'), 'Toggle edit button missing from header');
assert(html.includes('id="editor-toolbar"'), 'Editor toolbar missing from DOM');
assert(html.includes('id="save-status-pill"'), 'Save status pill missing from header');
assert(html.includes('id="raw-editor-textarea"'), 'Raw editor textarea missing');
assert(html.includes('id="tool-undo"'), 'Toolbar undo button missing');
assert(html.includes('id="tool-redo"'), 'Toolbar redo button missing');
assert(html.includes('id="save-status-pill" onclick="saveDocument()"'), 'Interactive save button missing from header');
assert(html.includes('toggleEditMode'), 'toggleEditMode script missing');
assert(html.includes('applyFormat'), 'applyFormat script missing');
assert(html.includes('editorUndo'), 'editorUndo script missing');
assert(html.includes('editorRedo'), 'editorRedo script missing');
assert(html.includes('saveDocument'), 'saveDocument script missing');
assert(html.includes('htmlToMarkdown'), 'htmlToMarkdown script missing');
assert(html.includes('triggerPrint()'), 'triggerPrint function missing');
assert(html.includes('@media print'), '@media print stylesheet missing');
assert(html.includes('@page'), '@page rule missing');
assert(html.includes('size: auto;'), 'print page size: auto missing');
assert(html.includes('margin: 15mm;'), 'print margin: 15mm missing');

// Verify Core Shell & Static Assets exist in project root
const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '..');
assert(fs.existsSync(path.join(rootDir, 'template.html')), 'template.html is missing');
assert(fs.existsSync(path.join(rootDir, 'favicon.svg')), 'favicon.svg is missing');
assert(fs.existsSync(path.join(rootDir, 'favicon.ico')), 'favicon.ico is missing');
assert(!fs.existsSync(path.join(rootDir, 'dot-md.exe')), 'dot-md.exe legacy binary should not exist');
assert(!fs.existsSync(path.join(rootDir, 'dot-md-setup.exe')), 'dot-md-setup.exe legacy binary should not exist');
assert(!fs.existsSync(path.join(rootDir, 'uninstall.exe')), 'uninstall.exe legacy binary should not exist');
assert(!fs.existsSync(path.join(rootDir, 'Microsoft.Web.WebView2.Core.dll')), 'WebView2 DLL should not exist');
assert(html.includes('clientProcessMarkdown'), 'clientProcessMarkdown script missing');
assert(html.includes('renderMarkdownDocument'), 'renderMarkdownDocument script missing');
assert(html.includes('__DOTMD_INITIAL_DATA__'), '__DOTMD_INITIAL_DATA__ placeholder missing');

// Verify Table Tools, ASCII Auto-Aligner, Base64 Image Pasting & Toast System
const { formatMarkdownTableText } = require('../lib/template');

// Test 1: ASCII Table Auto-Aligner Algorithm
const unalignedTable = [
  '| Col1 | Long Column Header 2 | C3 |',
  '| :--- | :---: | ---: |',
  '| Apple | Pie | 42 |',
  '| Very Long Product Item Name | Standard Size | 999.99 |'
].join('\n');

const alignedTable = formatMarkdownTableText(unalignedTable);
const alignedLines = alignedTable.split('\n');
assert.strictEqual(alignedLines.length, 4, 'Aligned table must have exactly 4 rows');

// Check that each column in every row is identically padded
const lineLengths = alignedLines.map(l => l.length);
assert(lineLengths.every(len => len === lineLengths[0]), 'All rows in aligned table must have the exact same character length');
assert(alignedLines[1].includes(':'), 'Alignment colons must be preserved in delimiter line');
assert(/:--+:/.test(alignedLines[1]), 'Center alignment :--+: must be preserved');
assert(/--+: \|$/.test(alignedLines[1]), 'Right alignment --+: must be preserved');

// Test 2: HTML UI & Modal Elements
assert(html.includes('id="app-toast"'), 'App toast element missing from HTML');
assert(html.includes('id="toast-message"'), 'Toast message element missing from HTML');
assert(html.includes('id="toast-icon"'), 'Toast icon element missing from HTML');
assert(html.includes('id="table-modal"'), 'Table modal element missing from HTML');
assert(html.includes('id="table-input-cols"'), 'Table cols input missing from HTML');
assert(html.includes('id="table-input-rows"'), 'Table rows input missing from HTML');
assert(html.includes('id="table-input-align"'), 'Table align select missing from HTML');
assert(html.includes('toggleTableModal'), 'toggleTableModal function missing');
assert(html.includes('confirmInsertTable'), 'confirmInsertTable function missing');
assert(html.includes('formatCurrentTable'), 'formatCurrentTable function missing');
assert(html.includes('showToast'), 'showToast function missing');
assert(html.includes('handleImagePaste'), 'handleImagePaste function missing');
assert(html.includes("document.addEventListener('paste', handleImagePaste)"), 'Image paste event listener missing');
assert(html.includes('Ctrl+Shift+T'), 'Ctrl+Shift+T shortcut missing from shortcut modal');

// Test 3: Publication-Grade Print & PDF Pagination Rules
assert(html.includes('thead {') && html.includes('display: table-header-group !important;'), 'thead table-header-group print rule missing');
assert(html.includes('tr {') && html.includes('break-inside: avoid !important;'), 'tr break-inside avoid print rule missing');
assert(html.includes('break-after: avoid !important;'), 'heading break-after avoid print rule missing');
// Test 4: Comprehensive Multi-Tier Responsive Layout Checks
assert(html.includes('@media (max-width: 1024px)'), 'Tablet breakpoint @media (max-width: 1024px) missing');
assert(html.includes('@media (max-width: 768px)'), 'Mobile breakpoint @media (max-width: 768px) missing');
assert(html.includes('@media (max-width: 480px)'), 'Extra-small breakpoint @media (max-width: 480px) missing');
assert(html.includes('class="toc-drawer-close"'), 'Outline drawer close button missing');
assert(html.includes('clamp('), 'Fluid typography clamp rules missing');

// Test 5: Verify all inline client JavaScript parses without any SyntaxErrors
const clientScripts = html.match(/<script>([\s\S]*?)<\/script>/gi) || [];
assert(clientScripts.length > 0, 'No inline client scripts found in HTML');
clientScripts.forEach((scriptTag, idx) => {
  const code = scriptTag.replace(/<\/?script>/gi, '');
  assert.doesNotThrow(() => {
    new vm.Script(code);
  }, `Client JavaScript in script ${idx} has a SyntaxError and fails to run`);
});

// Test 6: Verify clean decommissioning of legacy C# and presence of Tauri deployment scripts
assert(!fs.existsSync(path.join(__dirname, '..', 'src')), 'src/ legacy C# directory should not exist');
assert(!fs.existsSync(path.join(__dirname, '..', 'packages')), 'packages/ legacy directory should not exist');
assert(!fs.existsSync(path.join(__dirname, '..', 'scripts', 'build.bat')), 'scripts/build.bat should not exist');

const setupTauriPs1 = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'setup-tauri.ps1'), 'utf8');
const buildTauriBat = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'build-tauri.bat'), 'utf8');
assert(setupTauriPs1.includes('winget install Rustlang.Rustup'), 'Rustup installer missing in setup-tauri.ps1');
assert(setupTauriPs1.includes('Microsoft.VisualStudio.2022.BuildTools'), 'MSVC BuildTools missing in setup-tauri.ps1');
assert(buildTauriBat.includes('npx tauri build'), 'Tauri build invocation missing in build-tauri.bat');

// Verify GitHub Actions CI and Release Workflows
assert(fs.existsSync(path.join(__dirname, '..', '.github', 'workflows', 'ci.yml')), 'ci.yml missing');
assert(fs.existsSync(path.join(__dirname, '..', '.github', 'workflows', 'release.yml')), 'release.yml missing');
const releaseYml = fs.readFileSync(path.join(__dirname, '..', '.github', 'workflows', 'release.yml'), 'utf8');
assert(releaseYml.includes('tauri-apps/tauri-action'), 'tauri-action missing in release.yml');
assert(releaseYml.includes('macos-latest') && releaseYml.includes('windows-latest') && releaseYml.includes('ubuntu-22.04'), 'Release matrix missing platforms');


// Test 7: Verify Cross-Platform macOS and Linux Support
const { getLinuxDesktopFile, getMacosInfoPlist } = require('../lib/platform-installer');
const cliCode = fs.readFileSync(path.join(__dirname, '..', 'bin', 'cli.js'), 'utf8');
const installSh = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'install.sh'), 'utf8');
const uninstallSh = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'uninstall.sh'), 'utf8');

// Linux desktop entry verification
const desktopContent = getLinuxDesktopFile('dotmd', 'dot-md');
assert(desktopContent.includes('[Desktop Entry]'), 'Linux .desktop header missing');
assert(desktopContent.includes('Exec=dotmd %F'), 'Linux .desktop Exec command missing');
assert(desktopContent.includes('text/markdown'), 'Linux .desktop text/markdown MIME type missing');
assert(desktopContent.includes('MimeType='), 'Linux .desktop MimeType field missing');
assert(desktopContent.includes('StartupWMClass=dot md'), 'Linux StartupWMClass missing');

// macOS Info.plist verification
const infoPlist = getMacosInfoPlist();
assert(infoPlist.includes('com.dotmd.app'), 'macOS CFBundleIdentifier missing');
assert(infoPlist.includes('<string>markdown</string>'), 'macOS markdown extension missing');
assert(infoPlist.includes('<string>mdown</string>'), 'macOS mdown extension missing');
assert(infoPlist.includes('<key>CFBundleDocumentTypes</key>'), 'macOS CFBundleDocumentTypes missing');

// Cross-Platform CLI options and launcher verification
assert(cliCode.includes('--install'), 'CLI --install option missing');
assert(cliCode.includes('--uninstall'), 'CLI --uninstall option missing');
assert(cliCode.includes('--pdf'), 'CLI --pdf option missing');
assert(cliCode.includes('--print-to-pdf='), 'CLI headless print-to-pdf missing');
assert(cliCode.includes('darwin'), 'macOS darwin platform check missing in CLI');
assert(cliCode.includes('xdg-open'), 'Linux xdg-open fallback missing in CLI');
assert(cliCode.includes('--app='), 'Chromium --app mode launcher missing in CLI');

// Shell script verification
assert(installSh.includes('OS="$(uname -s)"'), 'OS detection missing in install.sh');
assert(installSh.includes('Darwin'), 'macOS branch missing in install.sh');
assert(installSh.includes('Linux'), 'Linux branch missing in install.sh');
assert(installSh.includes('dot-md.desktop'), 'Desktop entry generation missing in install.sh');
assert(uninstallSh.includes('dot-md.desktop'), 'Desktop entry cleanup missing in uninstall.sh');

// Test 8: Verify Tauri (Rust + System Webview) Architecture
const cargoToml = fs.readFileSync(path.join(__dirname, '..', 'src-tauri', 'Cargo.toml'), 'utf8');
const tauriConf = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json'), 'utf8'));
const capabilities = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src-tauri', 'capabilities', 'default.json'), 'utf8'));
const mainRs = fs.readFileSync(path.join(__dirname, '..', 'src-tauri', 'src', 'main.rs'), 'utf8');
const templateJs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'template.js'), 'utf8');

// Cargo manifest assertions
assert(cargoToml.includes('name = "dot-md"'), 'Cargo package name missing');
assert(cargoToml.includes('tauri ='), 'Tauri dependency missing in Cargo.toml');
assert(cargoToml.includes('notify ='), 'notify crate missing in Cargo.toml');
assert(cargoToml.includes('pulldown-cmark ='), 'pulldown-cmark crate missing in Cargo.toml');

// Tauri configuration assertions
assert.strictEqual(tauriConf.productName, 'dot md', 'Tauri productName mismatch');
assert.strictEqual(tauriConf.identifier, 'com.dotmd.app', 'Tauri identifier mismatch');
assert.strictEqual(tauriConf.app.withGlobalTauri, true, 'withGlobalTauri must be enabled');
assert(tauriConf.bundle.fileAssociations.some(fa => fa.ext.includes('md') && fa.ext.includes('markdown')), 'Tauri file associations missing');

// Capabilities assertions
assert(capabilities.permissions.includes('core:default'), 'core:default capability missing');
assert(capabilities.permissions.includes('fs:default'), 'fs:default capability missing');

// Main Rust entrypoint assertions
assert(mainRs.includes('get_initial_document'), 'get_initial_document command missing in main.rs');
assert(mainRs.includes('save_document'), 'save_document command missing in main.rs');
assert(mainRs.includes('parse_markdown_native'), 'parse_markdown_native command missing in main.rs');
assert(mainRs.includes('setup_file_watcher'), 'setup_file_watcher missing in main.rs');
assert(mainRs.includes('md-file-updated'), 'md-file-updated event missing in main.rs');

// Template dual-mode IPC assertions
assert(templateJs.includes('window.__TAURI__'), 'Tauri window.__TAURI__ check missing in template.js');
assert(templateJs.includes('save_document'), 'Tauri save_document invoke missing in template.js');
assert(templateJs.includes('md-file-updated'), 'Tauri md-file-updated listener missing in template.js');

// Test 9: Verify In-Page Quick Find Engine & Headless PDF Output
assert(html.includes('id="doc-search-bar"'), 'In-page search bar missing from HTML');
assert(html.includes('id="doc-search-input"'), 'Search input missing from HTML');
assert(html.includes('id="search-count-badge"'), 'Search count badge missing from HTML');
assert(html.includes('id="search-prev-btn"'), 'Search prev button missing from HTML');
assert(html.includes('id="search-next-btn"'), 'Search next button missing from HTML');
assert(html.includes('class="search-close-btn"'), 'Search close button missing from HTML');
assert(html.includes('id="search-toggle-btn"'), 'Search toggle header button missing from HTML');
assert(html.includes('toggleSearch'), 'toggleSearch function missing');
assert(html.includes('executeSearch'), 'executeSearch function missing');
assert(html.includes('searchNavigate'), 'searchNavigate function missing');
assert(html.includes('mark.search-match'), 'search-match CSS rule missing');
assert(html.includes('mark.search-match.active'), 'search-match active CSS rule missing');
assert(html.includes('Ctrl+F / /'), 'Search shortcut missing from shortcut modal');

// Test 10: Verify YAML Frontmatter Metadata Cards & Interactive Task Lists
const { extractFrontmatter } = require('../lib/template');
const sampleWithFm = [
  '---',
  'title: Distributed Consensus',
  'author: Elena Rostova',
  'tags: [raft, paxos, replication]',
  'status: "Production"',
  '---',
  '# Real Section',
  '- [ ] Task item one',
  '- [x] Task item two'
].join('\n');

const fmResult = extractFrontmatter(sampleWithFm);
assert(fmResult.frontmatter, 'Frontmatter failed to parse');
assert.strictEqual(fmResult.frontmatter.title, 'Distributed Consensus');
assert.strictEqual(fmResult.frontmatter.author, 'Elena Rostova');
assert.deepStrictEqual(fmResult.frontmatter.tags, ['raft', 'paxos', 'replication']);
assert.strictEqual(fmResult.frontmatter.status, 'Production');

// Test BOM (Byte Order Mark) & trailing space resilience
const bomFm = '\uFEFF---\r\ntitle: "BOM Systems"\r\nauthor: Admin  \r\n---\r\n# Hello';
const bomResult = extractFrontmatter(bomFm);
assert(bomResult.frontmatter, 'BOM frontmatter failed to parse');
assert.strictEqual(bomResult.frontmatter.title, 'BOM Systems');
assert.strictEqual(bomResult.frontmatter.author, 'Admin');

const fmHtml = renderTemplate({ markdown: sampleWithFm });
assert(fmHtml.includes('class="frontmatter-card"'), 'Frontmatter card missing from rendered HTML');
assert(fmHtml.includes('class="frontmatter-tag">raft</span>'), 'Tag raft missing from frontmatter card');
assert(fmHtml.includes('class="frontmatter-key">author</span>'), 'Key author missing from frontmatter card');
assert(fmHtml.includes('contenteditable="false"'), 'Frontmatter card should have contenteditable="false"');
assert(fmHtml.includes('data-raw-frontmatter='), 'Frontmatter card should have data-raw-frontmatter attribute');
assert(!fmHtml.includes('data-slug="title-distributed-consensus"'), 'Frontmatter leaked into outline TOC slug');
assert(!fmHtml.includes('<h2 id="title-distributed-consensus'), 'Frontmatter rendered as setext H2 heading');

// Verify sample.md rendering integrity
const sampleMdContent = fs.readFileSync(path.join(__dirname, '..', 'sample.md'), 'utf8');
const sampleRendered = renderTemplate({ markdown: sampleMdContent });
assert(sampleRendered.includes('class="frontmatter-card"'), 'sample.md frontmatter card missing');
assert(!sampleRendered.includes('data-slug="title-the-architecture-of-resilient-systems"'), 'sample.md frontmatter leaked into TOC outline');
assert(!sampleRendered.includes('<h2 id="title-the-architecture'), 'sample.md frontmatter leaked as setext H2');

assert(fmHtml.includes('class="task-checkbox"'), 'Interactive task checkbox class missing');
assert(!fmHtml.includes('task-checkbox" disabled'), 'Task checkbox should not have disabled attribute');
assert(fmHtml.includes('handleTaskCheckboxToggle'), 'handleTaskCheckboxToggle function missing');
assert(fmHtml.includes('copyCode'), 'copyCode function missing');

// Test 11: Verify Industry-Standard Installer Manifests & Tauri Packaging Configurations
const installerDir = path.join(__dirname, '..', 'installer');
const expectedInstallerFiles = [
  path.join(installerDir, 'README.md'),
  path.join(installerDir, 'windows', 'winget', 'dotmd.yaml'),
  path.join(installerDir, 'macos', 'homebrew', 'dotmd.rb'),
  path.join(installerDir, 'linux', 'dot-md.desktop'),
  path.join(installerDir, 'linux', 'dot-md.xml')
];

for (const filePath of expectedInstallerFiles) {
  assert(fs.existsSync(filePath), `Missing industry standard installer file: ${filePath}`);
  const stat = fs.statSync(filePath);
  assert(stat.size > 0, `Installer file is empty: ${filePath}`);
}

// Verify WinGet manifest schema
const wingetContent = fs.readFileSync(path.join(installerDir, 'windows', 'winget', 'dotmd.yaml'), 'utf8');
assert(wingetContent.includes('PackageIdentifier: dotmd.dotmd'), 'Invalid WinGet package identifier');
assert(wingetContent.includes('InstallerType: nullsoft'), 'WinGet missing NSIS installer type');
assert(wingetContent.includes('InstallerType: wix'), 'WinGet missing WiX MSI installer type');

// Verify Homebrew Cask formula
const brewContent = fs.readFileSync(path.join(installerDir, 'macos', 'homebrew', 'dotmd.rb'), 'utf8');
assert(brewContent.includes('cask "dotmd"'), 'Invalid Homebrew Cask definition');
assert(brewContent.includes('.dmg'), 'Homebrew Cask missing DMG URL');
assert(brewContent.includes('app "dot md.app"'), 'Homebrew Cask missing app stanza');

// Verify Freedesktop Linux specifications
const linuxDesktopContent = fs.readFileSync(path.join(installerDir, 'linux', 'dot-md.desktop'), 'utf8');
assert(linuxDesktopContent.includes('[Desktop Entry]'), 'Linux desktop file missing [Desktop Entry]');
assert(linuxDesktopContent.includes('MimeType=text/markdown;'), 'Linux desktop file missing Markdown MIME');

const mimeContent = fs.readFileSync(path.join(installerDir, 'linux', 'dot-md.xml'), 'utf8');
assert(mimeContent.includes('xmlns="http://www.freedesktop.org/standards/shared-mime-info"'), 'Linux XML missing shared-mime-info namespace');

// Verify Tauri v2 Bundle Configuration for Industry-Standard Targets
const tauriConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json'), 'utf8'));
assert(tauriConfig.bundle, 'Missing bundle in tauri.conf.json');
assert.strictEqual(tauriConfig.bundle.targets, 'all', 'Bundle targets must be "all"');
assert(tauriConfig.bundle.windows.wix, 'Missing WiX MSI target in tauri.conf.json');
assert(tauriConfig.bundle.windows.nsis, 'Missing NSIS target in tauri.conf.json');
assert(tauriConfig.bundle.macOS.dmg, 'Missing DMG target in tauri.conf.json');
assert(tauriConfig.bundle.linux.deb, 'Missing DEB target in tauri.conf.json');
assert(tauriConfig.bundle.linux.appimage, 'Missing AppImage target in tauri.conf.json');
assert(Array.isArray(tauriConfig.bundle.fileAssociations), 'Missing file associations array');
assert(tauriConfig.bundle.publisher === 'The Software Co.', 'Tauri bundle publisher must be "The Software Co."');
assert(wingetContent.includes('Publisher: The Software Co.'), 'WinGet manifest publisher must be "The Software Co."');

const pkgJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
assert.strictEqual(pkgJson.author, 'The Software Co.', 'package.json author must be "The Software Co."');

const cargoContent = fs.readFileSync(path.join(__dirname, '..', 'src-tauri', 'Cargo.toml'), 'utf8');
assert(cargoContent.includes('authors = ["The Software Co."]'), 'Cargo.toml authors must be ["The Software Co."]');

// Test 12: Verify Lossless Native Vector Diagram Pan & Zoom & Viewport Framing
const templateSrc = fs.readFileSync(path.join(__dirname, '..', 'lib', 'template.js'), 'utf8');
assert(templateSrc.includes('applyViewBox'), 'applyViewBox missing in template.js');
assert(templateSrc.includes('zoomAtPoint'), 'zoomAtPoint missing in template.js');
assert(templateSrc.includes('.diagram-viewport'), '.diagram-viewport missing in template.js');
assert(!templateSrc.includes('.diagram-canvas {'), 'Legacy .diagram-canvas CSS should be removed');
assert(templateSrc.includes('diagram-zoom-badge'), 'diagram-zoom-badge missing in template.js');
assert(templateSrc.includes('.diagram-fullscreen'), 'Fullscreen styles missing in template.js');
assert(templateSrc.includes('.diagram-hint'), 'Scroll hint styles missing in template.js');
assert(templateSrc.includes('calcBaseViewBox'), 'calcBaseViewBox aspect matching missing in template.js');
assert(templateSrc.includes('toggleFullscreen'), 'toggleFullscreen missing in template.js');
assert(templateSrc.includes('.mermaid-container svg .flowchart-link'), 'Flowchart link styles missing in template.js');
assert(templateSrc.includes('fill: none !important'), 'fill: none !important override missing in template.js');
assert(templateSrc.includes('xMidYMid meet'), 'xMidYMid meet aspect ratio missing in template.js');

console.log('✔ All TOC, Outline, Responsive, Zen, Wide, Raw, Logo, Favicon, Table Tools, ASCII Aligner, Print Pagination, Toast, Client JS, In-Page Search, Headless PDF, YAML Frontmatter, Interactive Tasks, Windows, macOS, Linux, Industry Standard Installers & Lossless Vector Zoom checks passed successfully.');


