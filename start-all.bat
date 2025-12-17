@echo off
title Automated Attendance System - Start All Services
color 0A

echo ============================================
echo   AUTOMATED ATTENDANCE SYSTEM
echo   Starting All Services...
echo ============================================
echo.

:: Get the directory where this script is located
set ROOT_DIR=%~dp0

:: Start Backend
echo [1/3] Starting Backend Server...
start "BACKEND - Port 5001" cmd /k "cd /d %ROOT_DIR%backend && npm run dev"
timeout /t 2 /nobreak > nul

:: Start Frontend
echo [2/3] Starting Frontend Server...
start "FRONTEND - Port 3001" cmd /k "cd /d %ROOT_DIR%frontend && npm run dev"
timeout /t 2 /nobreak > nul

:: Start AI-ML Service
echo [3/3] Starting AI-ML Service...
start "AI-ML - Port 8000" cmd /k "cd /d %ROOT_DIR%ai-ml && .\venv\Scripts\activate && python api/app.py"

echo.
echo ============================================
echo   ALL SERVICES STARTED!
echo ============================================
echo.
echo   Frontend:  http://localhost:3001
echo   Backend:   http://localhost:5001
echo   AI-ML:     http://localhost:8000
echo.
echo   Close the opened windows to stop services
echo ============================================
echo.
pause
