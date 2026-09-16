# ============================================================
#   dot md - Tauri Environment Setup & Diagnostics
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host "  dot md - Tauri (Rust + Webview) Toolchain Setup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host ""

# 1. Check Node.js & npm
$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue

if (-not $node) {
    Write-Host "[X] Node.js is required but not found in PATH." -ForegroundColor Red
    Write-Host "    Download and install Node.js from https://nodejs.org" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "[OK] Node.js found: $(node --version)" -ForegroundColor Green
}

# 2. Check Rust Toolchain
$cargo = Get-Command cargo -ErrorAction SilentlyContinue
$rustc = Get-Command rustc -ErrorAction SilentlyContinue

if (-not $cargo -or -not $rustc) {
    Write-Host "[!] Rust toolchain (cargo/rustc) is not installed." -ForegroundColor Yellow
    Write-Host "    Installing Rustup via winget..." -ForegroundColor Cyan
    try {
        winget install Rustlang.Rustup --accept-package-agreements --accept-source-agreements
        Write-Host "[OK] Rustup installed. Please restart your shell to reload PATH." -ForegroundColor Green
    } catch {
        Write-Host "[X] Could not install automatically. Please run: winget install Rustlang.Rustup" -ForegroundColor Red
    }
} else {
    Write-Host "[OK] Rust found: $(rustc --version)" -ForegroundColor Green
    Write-Host "[OK] Cargo found: $(cargo --version)" -ForegroundColor Green
}

# 3. Check C++ Build Tools (MSVC)
$cl = Get-Command cl -ErrorAction SilentlyContinue
$vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$hasVcTools = $false

if (Test-Path $vsWhere) {
    $vcInstalled = & $vsWhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64
    if ($vcInstalled) {
        $hasVcTools = $true
    }
}

if ($hasVcTools -or $cl) {
    Write-Host "[OK] Visual Studio C++ Build Tools detected." -ForegroundColor Green
} else {
    Write-Host "[!] Visual Studio C++ Build Tools not detected." -ForegroundColor Yellow
    Write-Host "    Tauri on Windows requires the MSVC C++ Build Tools." -ForegroundColor Yellow
    Write-Host "    To install automatically, run:" -ForegroundColor Cyan
    Write-Host "      winget install Microsoft.VisualStudio.2022.BuildTools --override `"--passive --wait --add Microsoft.VisualStudio.Workload.VCTools`"" -ForegroundColor White
}

# 4. Install npm dependencies (including @tauri-apps/cli)
Write-Host ""
Write-Host "Installing npm dependencies and Tauri CLI..." -ForegroundColor Cyan
npm install

Write-Host ""
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host "  Setup Complete! Next Steps:" -ForegroundColor Green
Write-Host "  - Run in dev mode:    npm run tauri:dev" -ForegroundColor White
Write-Host "  - Build installer:    npm run tauri:build" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor DarkGray
Write-Host ""
