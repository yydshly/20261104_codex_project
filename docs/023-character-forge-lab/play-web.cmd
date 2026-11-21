@echo off
powershell.exe -NoProfile -File "%~dp0scripts\preview-warlord.ps1" -OpenBrowser
if errorlevel 1 pause
