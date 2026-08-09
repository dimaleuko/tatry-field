@echo off
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20+ is required. Install it from nodejs.org and run this file again.
  pause
  exit /b 1
)
start "" http://localhost:8787
node server.js
