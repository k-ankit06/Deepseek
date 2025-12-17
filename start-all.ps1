# Automated Attendance System - Start All Services
# Run this script to start Frontend, Backend, and AI-ML services together

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  AUTOMATED ATTENDANCE SYSTEM" -ForegroundColor Cyan
Write-Host "  Starting All Services..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend (Node.js)
Write-Host "[1/3] Starting Backend Server..." -ForegroundColor Yellow
$backendPath = Join-Path $rootDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'BACKEND SERVER' -ForegroundColor Green; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start Frontend (React + Vite)
Write-Host "[2/3] Starting Frontend Server..." -ForegroundColor Yellow
$frontendPath = Join-Path $rootDir "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'FRONTEND SERVER' -ForegroundColor Blue; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

# Start AI-ML Service (Python Flask)
Write-Host "[3/3] Starting AI-ML Service..." -ForegroundColor Yellow
$aimlPath = Join-Path $rootDir "ai-ml"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$aimlPath'; Write-Host 'AI-ML SERVICE' -ForegroundColor Magenta; .\venv\Scripts\activate; python api/app.py" -WindowStyle Normal

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  ALL SERVICES STARTED!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:3001" -ForegroundColor White
Write-Host "  Backend:   http://localhost:5001" -ForegroundColor White
Write-Host "  AI-ML:     http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "  Press Ctrl+C in each terminal to stop" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Green
