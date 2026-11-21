@echo off
setlocal
set "WARLORD_GODOT=%~dp0..\..\tools\godot\Godot_v4.5.2-stable_win64.exe"
if exist "%WARLORD_GODOT%" goto run_game
for %%G in (godot.exe godot4.exe) do for /f "delims=" %%P in ('where %%G 2^>nul') do (
  set "WARLORD_GODOT=%%P"
  goto run_game
)
echo Install Godot 4.5 or newer, then open project.godot.
echo https://godotengine.org/download/windows/
exit /b 1
:run_game
set "APPDATA=%~dp0userdata"
if not exist "%APPDATA%" mkdir "%APPDATA%"
"%WARLORD_GODOT%" --path "%~dp0." %*
