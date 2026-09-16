@echo off
setlocal
title dot md - Windows Uninstaller

echo ============================================================
echo   dot md - Windows Desktop Uninstaller
echo ============================================================
echo.

set "ROOT_DIR=%~dp0"
cd /d "%ROOT_DIR%"

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is required.
    pause
    exit /b 1
)

echo Removing .md file associations and Explorer context menu...
node "%ROOT_DIR%bin\cli.js" --uninstall

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   Uninstallation Complete!
    echo   Windows Registry integration has been cleanly removed.
    echo ============================================================
) else (
    echo.
    echo [ERROR] Uninstallation failed.
)

echo.
pause
