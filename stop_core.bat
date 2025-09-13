@echo on
setlocal EnableExtensions
cd /d "%~dp0"

echo ===========================
echo   🛑 STOP ZANELLAZEN (porta 3001)
echo ===========================

set "PORT=3001"
set "PID="
set "PROC="

rem -- Trova il PID che ascolta su 3001 --
for /f "tokens=5" %%A in ('netstat -ano ^| findstr /r /c:":%PORT% .*LISTENING"') do set "PID=%%A"

if not defined PID (
  echo [ZanellaZen] nessun processo in ascolto su :%PORT%.
  goto VERIFY
)

rem -- Identifica il processo (node/npm) --
tasklist /fi "PID eq %PID%" | findstr /i "node.exe" >nul && set "PROC=node.exe"
tasklist /fi "PID eq %PID%" | findstr /i "npm.exe"  >nul && set "PROC=npm.exe"
if not defined PROC set "PROC=PID %PID%"

echo [ZanellaZen] arresto %PROC% (PID %PID%)...
taskkill /PID %PID% /T /F >nul 2>&1
if errorlevel 1 (
  echo  - warning: taskkill ha restituito un errore.
) else (
  echo  ✅ OK terminato.
)

:VERIFY
echo.
echo [VERIFY]
netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul && (
  echo  - porta %PORT% ANCORA in ascolto.
) || (
  echo  ✅ porta %PORT% libera.
)

echo.
echo ==== 🛑 STOP COMPLETATO ====
pause >nul
endlocal