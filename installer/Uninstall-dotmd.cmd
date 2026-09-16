@echo off
setlocal
title dot md - Windows Uninstaller

echo ============================================================
echo   Uninstalling dot md...
echo ============================================================
echo.

"%~dp0dotmd-setup.exe" /uninstall
if %ERRORLEVEL% EQU 0 (
    echo [OK] Uninstallation completed.
) else (
    echo [ERROR] Uninstallation exited with code %ERRORLEVEL%.
)

pause
