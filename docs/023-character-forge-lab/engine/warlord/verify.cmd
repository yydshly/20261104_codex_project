@echo off
setlocal
set "WARLORD_GODOT=%~dp0..\..\tools\godot\Godot_v4.5.2-stable_win64_console.exe"
if exist "%WARLORD_GODOT%" goto verify_game
for %%G in (godot_console.exe godot4_console.exe godot.exe godot4.exe) do for /f "delims=" %%P in ('where %%G 2^>nul') do (
  set "WARLORD_GODOT=%%P"
  goto verify_game
)
echo Install Godot 4.5 or newer and add it to PATH.
echo Then run verify.cmd again, or use Godot with the documented headless commands.
exit /b 1
:verify_game
set "APPDATA=%~dp0userdata"
if not exist "%APPDATA%" mkdir "%APPDATA%"
"%WARLORD_GODOT%" --headless --path "%~dp0." --import
if errorlevel 1 exit /b 1
"%WARLORD_GODOT%" --headless --path "%~dp0." --script res://scripts/smoke_test.gd
if errorlevel 1 exit /b 1
"%WARLORD_GODOT%" --headless --path "%~dp0." --script res://scripts/secondary_smoke_test.gd
