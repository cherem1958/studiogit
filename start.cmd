@echo off
cd /d "%~dp0"
echo Starting Scriptorium. Keep this window open while using the local server.
echo Open http://localhost:3000 in your browser.
node server.mjs
if errorlevel 1 pause
