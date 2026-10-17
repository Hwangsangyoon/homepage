@echo off
chcp 65001 >nul
cd /d "%~dp0"
node --test tests/*.test.mjs
if errorlevel 1 echo 실행 중 문제가 발생했습니다. 오류 문구를 확인하세요.
pause
