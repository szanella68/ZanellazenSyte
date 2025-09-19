@echo on
setlocal EnableExtensions

set "ZANELLAZEN_DIR=%~dp0"
set "ZANELLAZEN_PORT=3001"

cd /d "%ZANELLAZEN_DIR%"

where node >nul 2>&1
if errorlevel 1 (
  echo [ERRORE] Node.js non nel PATH.
  goto HOLD
)

rem assicurati che npm sia disponibile
where npm >nul 2>&1
if errorlevel 1 (
  echo [ERRORE] npm non nel PATH.
  goto HOLD
)

rem installa dipendenze se mancano
if not exist "node_modules" (
  echo [NPM] Installazione dipendenze iniziale...
  call npm install
) else (
  echo [NPM] Verifica pacchetti chiave...
  call npm ls express >nul 2>&1
  if errorlevel 1 (
    echo [NPM] Installo dipendenze mancanti
    call npm install
  )
)

rem evita doppio avvio: se 3001 gia' in LISTENING non rilancia
netstat -ano | findstr /r /c:":%ZANELLAZEN_PORT% .*LISTENING" >nul
if not errorlevel 1 (
  echo [ZanellaZen] gia' attivo su :%ZANELLAZEN_PORT%. Niente rilancio.
  goto HOLD
)

rem Fallback se non definite
if not defined PORT set "PORT=%ZANELLAZEN_PORT%"
if not defined NODE_ENV set "NODE_ENV=production"

echo -----------------------------------------
echo [RUN] ZANELLAZEN PRODUZIONE su porta %PORT%
echo Environment: %NODE_ENV%
echo -----------------------------------------
node -v
echo Avvio server.js...
node server.js
echo [EXIT] Codice: %errorlevel%

:HOLD
echo.
echo (ZanellaZen) Finestra bloccata. Premi un tasto per chiudere...
pause >nul
endlocal
