@echo off
setlocal enabledelayedexpansion

rem === Config Zanellazen WebApp ===
set "REPO_DIR=C:\filepubblici\mia_homepage_alter\zanellazen-nodejs"
set "REMOTE_URL=https://github.com/szanella68/ZanellazenSyte.git"

cd /d "%REPO_DIR%" || (echo Repo non trovata: %REPO_DIR% & pause & exit /b 1)

git --version >nul 2>&1 || (echo Git non trovato nel PATH. Installa Git e riprova. & pause & exit /b 1)

rem === Config utente globale (se mancante) ===
set "GUN="
set "GUE="
for /f "delims=" %%u in ('git config --global user.name 2^>nul') do set "GUN=%%u"
for /f "delims=" %%e in ('git config --global user.email 2^>nul') do set "GUE=%%e"
if not defined GUN (
  echo Configura Git: user.name non impostato.
  set /p GUN=Inserisci Git user.name: 
  if defined GUN git config --global user.name "!GUN!"
)
if not defined GUE (
  echo Configura Git: user.email non impostato.
  set /p GUE=Inserisci Git user.email: 
  if defined GUE git config --global user.email "!GUE!"
)

rem === Inizializza repo se necessario ===
set "INSIDE="
for /f "delims=" %%x in ('git rev-parse --is-inside-work-tree 2^>nul') do set "INSIDE=%%x"
if /i not "%INSIDE%"=="true" (
  echo Inizializzo repository Git...
  git init || (echo git init fallito. & pause & exit /b 1)
  git branch -M main
)

rem === Imposta/aggiorna origin ===
set "CURRENT_ORIGIN="
for /f "delims=" %%u in ('git remote get-url origin 2^>nul') do set "CURRENT_ORIGIN=%%u"
if not defined CURRENT_ORIGIN (
  echo Imposto origin su %REMOTE_URL%
  git remote add origin "%REMOTE_URL%" || (echo Configurazione origin fallita. & pause & exit /b 1)
) else (
  if /i not "%CURRENT_ORIGIN%"=="%REMOTE_URL%" (
    echo Origin attuale: %CURRENT_ORIGIN%
    set /p UPD=Vuoi sostituirlo con %REMOTE_URL%? [s/N]: 
    if /i "%UPD%"=="s" (
      git remote set-url origin "%REMOTE_URL%" || (echo Aggiornamento origin fallito. & pause & exit /b 1)
    )
  )
)

echo ===== 🔄 ZANELLAZEN GIT SYNC =====

rem Crea .gitkeep nelle directory vuote (escluse .git e node_modules)
for /f "delims=" %%D in ('dir /ad /b /s') do (
  set "name=%%~nxD"
  if /i not "!name!"==".git" if /i not "!name!"=="node_modules" (
    dir "%%D\*" /a-d /b >nul 2>&1 || (echo.>"%%D\.gitkeep")
  )
)

echo Aggiungo tutte le modifiche...
git add -A

set "HAVECHANGES="
git diff --cached --quiet || set "HAVECHANGES=1"

if defined HAVECHANGES (
  set "commit_msg="
  set /p commit_msg=Messaggio commit (default: zanellazen update): 
  if not defined commit_msg set "commit_msg=zanellazen update"
  git commit -m "!commit_msg!" || (echo Commit fallito. & pause & exit /b 1)
) else (
  echo Nessuna modifica da commitare.
)

set "BRANCH="
for /f "delims=" %%b in ('git symbolic-ref --short -q HEAD 2^>nul') do set "BRANCH=%%b"
if not defined BRANCH set "BRANCH=main"

rem Se il branch remoto non esiste, crea upstream; altrimenti pull --rebase + push
git ls-remote --exit-code --heads origin %BRANCH% >nul 2>&1
if errorlevel 1 (
  echo Creo upstream su origin/%BRANCH%...
  git push -u origin %BRANCH% || (echo Push fallito. & pause & exit /b 1)
) else (
  echo Pull --rebase da origin/%BRANCH%...
  git pull --rebase origin %BRANCH%
  if errorlevel 1 (
    echo Pull fallito, provo con --allow-unrelated-histories...
    git pull --rebase --allow-unrelated-histories origin %BRANCH% || (echo Conflitti: risolvili e rilancia. & pause & exit /b 1)
  )
  echo Push su origin/%BRANCH%...
  git push origin %BRANCH% || (echo Push fallito. & pause & exit /b 1)
)

echo.
echo ✅ Sincronizzazione completata.
git status -sb
pause

