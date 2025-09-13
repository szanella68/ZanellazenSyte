@echo off
setlocal EnableExtensions
cd /d "%~dp0"

echo ================================================
echo   🌐 ZANELLAZEN LAUNCH: Apache + Node.js
echo ================================================

rem --- avvia Apache in foreground (nuova finestra) ---
start "Apache-SSL" cmd /k "%cd%\start_apache.bat"

rem --- attesa breve ---
timeout /t 2 /nobreak >nul

rem --- avvia ZanellaZen Node.js (nuova finestra) ---
start "ZanellaZen PROD" cmd /k "%cd%\start_zanellazen.bat"

echo.
echo ✅ Finestre lanciate:
echo   - Apache-SSL (443)
echo   - ZanellaZen (3001)
echo.
echo Premi un tasto per aprire il browser...
pause >nul
start https://zanserver.sytes.net/zanellazen/
echo.
echo Puoi chiudere questa finestra. Le altre restano aperte.
pause >nul
endlocal