@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js before starting Society Atlas.
  pause
  exit /b 1
)
echo Society Atlas: http://127.0.0.1:4173
echo Keep this window open while using the local website.
node server.mjs
pause
