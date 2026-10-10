# CloudSentinel AI - 1-Click Launch Script
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " CloudSentinel AI - AWS Cloud Innovation Challenge Demo" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Start Backend API Server
Write-Host "`n[1/2] Starting Serverless Backend API on http://localhost:8000..." -ForegroundColor Green
$backendJob = Start-Process python -ArgumentList "backend/src/server.py" -PassThru -NoNewWindow

# Wait 2 seconds for backend to bind
Start-Sleep -Seconds 2

# 2. Start Frontend Dashboard
Write-Host "[2/2] Starting React + Vite Frontend Dashboard on http://localhost:5173..." -ForegroundColor Green
Set-Location frontend
npm run dev

# Cleanup on exit
Stop-Process -Id $backendJob.Id -ErrorAction SilentlyContinue
