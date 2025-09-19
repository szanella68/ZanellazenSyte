@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "REPO_DIR=%~dp0"

cd /d "%REPO_DIR%" || (echo Repo non trovata: %REPO_DIR% & pause & exit /b 1)
for /f "delims=" %%x in ('git rev-parse --is-inside-work-tree 2^>nul') do set "INSIDE=%%x"
if /i not "!INSIDE!"=="true" (
  echo La cartella non e' una repository Git valida.
  pause
  exit /b 1
)

echo ===== 🌐 ZANELLAZEN GIT SYNC =====

for /f "delims=" %%D in ('dir /ad /b /s') do (
  set "name=%%~nxD"
  if /i not "!name!"==".git" if /i not "!name!"=="node_modules" (
    dir "%%D\*" /a-d /b >nul 2>&1 || (echo.>"%%D\.gitkeep")
  )
)

echo Aggiungo file e cartelle...
git add -A

set "HAVECHANGES="
git diff --cached --quiet || set "HAVECHANGES=1"

if defined HAVECHANGES (
  set "commit_msg="
  set /p commit_msg="Messaggio commit (default: zanellazen update): "
  if not defined commit_msg set "commit_msg=zanellazen update"
  git commit -m "!commit_msg!" || (echo Commit fallito. & pause & exit /b 1)
) else (
  echo Nessuna modifica da commitare.
)

for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%b"
if not defined BRANCH set "BRANCH=main"

git ls-remote --exit-code --heads origin %BRANCH% >nul 2>&1
if errorlevel 1 (
  echo Creo upstream origin/%BRANCH%...
  git push -u origin %BRANCH% || (echo Push fallito. & pause & exit /b 1)
) else (
  echo Pull --rebase da origin/%BRANCH%...
  git pull --rebase origin %BRANCH% || (echo Conflitti rilevati. Risolvere e rilanciare. & pause & exit /b 1)
  echo Push su origin/%BRANCH%...
  git push origin %BRANCH% || (echo Push fallito. & pause & exit /b 1)
)

echo.
echo ✅ Repository sincronizzato con successo.
git status -sb
pause
