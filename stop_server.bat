@echo off
cd /d "%~dp0"
echo 🛑 Arresto ZanellaZen...
start "STOP ZANELLAZEN" cmd /k "%~dp0stop_core.bat"