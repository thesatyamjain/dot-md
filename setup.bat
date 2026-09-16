@echo off
setlocal
title dot md - Windows Installer

echo ============================================================
echo   dot md - Windows Desktop Installer
echo ============================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is required to run the preview engine.
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [1/2] Registering .md and .markdown associations in Windows Registry...
echo [2/2] Adding "Open with dot md" Explorer context menu...
echo.

node "%ROOT_DIR%bin\cli.js" --install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   Installation Successful!
    echo.
    echo   - Double-click any .md file to open in dot md.
    echo   - Right-click any file and choose "Open with dot md".
    echo   - Run "uninstall.bat" anytime to cleanly remove integration.
    echo ============================================================
) else (
    echo.
    echo [ERROR] Installation failed.
)

echo.
pause
