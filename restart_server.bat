@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ================================================
echo   🔄 ZANELLAZEN RESTART: Stop + Start
echo ================================================

echo [1/2] Arresto ZanellaZen...
call "%~dp0stop_server.bat"

echo.
echo [2/2] Riavvio ZanellaZen...
timeout /t 2 /nobreak >nul

call "%~dp0start_server.bat"

endlocal