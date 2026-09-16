@echo off
setlocal
title dot md - Windows Installer

echo ============================================================
echo   Installing dot md - Publication-grade Markdown Viewer
echo ============================================================
echo.

"%~dp0dotmd-setup.exe"
if %ERRORLEVEL% EQU 0 (
    echo [OK] Setup completed.
) else (
    echo [ERROR] Setup exited with code %ERRORLEVEL%.
)

pause
