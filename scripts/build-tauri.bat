@echo off
setlocal

echo ============================================================
echo   Building dot md Desktop App via Tauri (Rust)
echo ============================================================
echo.

set "ROOT_DIR=%~dp0.."
cd /d "%ROOT_DIR%"

echo [1/3] Generating template.html shell...
node "%ROOT_DIR%\scripts\generate-shell.js"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate template.html
    pause
    exit /b 1
)

echo [2/3] Checking Rust environment...
where cargo >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Cargo is not found in PATH.
    echo Please run scripts\setup-tauri.ps1 to configure the Rust toolchain.
    pause
    exit /b 1
)

echo [3/3] Compiling Tauri bundle (.msi / .exe)...
npx tauri build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Tauri build failed.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   Tauri Build Complete!
echo   Binaries and installers generated in:
echo     src-tauri\target\release\bundle\
echo ============================================================
echo.
