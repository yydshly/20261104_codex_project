@echo off
setlocal
set "EMBERFALL_GODOT=%~dp0..\..\tools\godot\Godot_v4.5.2-stable_win64.exe"
if exist "%EMBERFALL_GODOT%" goto run_game
for %%G in (godot.exe godot4.exe) do for /f "delims=" %%P in ('where %%G 2^>nul') do (
  set "EMBERFALL_GODOT=%%P"
  goto run_game
)
echo Godot 4.5 or newer was not found. Open project.godot in an installed Godot editor.
echo Official download: https://godotengine.org/download/windows/
exit /b 1
:run_game
set "APPDATA=%~dp0userdata"
if not exist "%APPDATA%" mkdir "%APPDATA%"
"%EMBERFALL_GODOT%" --path "%~dp0." %*
