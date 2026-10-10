@echo off
title CloudSentinel AI - Launcher
echo ============================================================
echo  CloudSentinel AI - AWS Cloud Innovation Challenge
echo ============================================================

echo [1/2] Starting Serverless Backend API on http://localhost:8000...
start /b python backend/src/server.py

timeout /t 2 /nobreak >nul

echo [2/2] Starting React Frontend on http://localhost:5173...
cd frontend
npm run dev
