@echo off
chcp 65001 >nul
cd /d "%~dp0"
node scripts/import-v3-assets.mjs
pause
