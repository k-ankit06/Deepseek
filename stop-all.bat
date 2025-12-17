@echo off
title Stop All Services
color 0C

echo ============================================
echo   STOPPING ALL SERVICES...
echo ============================================
echo.

:: Kill Node.js processes (Backend & Frontend)
echo Stopping Node.js servers...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% == 0 (
    echo   [OK] Node.js processes stopped
) else (
    echo   [--] No Node.js processes found
)

:: Kill Python processes (AI-ML)
echo Stopping Python servers...
taskkill /F /IM python.exe 2>nul
if %ERRORLEVEL% == 0 (
    echo   [OK] Python processes stopped
) else (
    echo   [--] No Python processes found
)

echo.
echo ============================================
echo   ALL SERVICES STOPPED!
echo ============================================
echo.
pause
