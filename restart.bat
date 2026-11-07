@echo off
setlocal
title 3DHeat - restart

rem Stop the running server, then start a fresh one in this window.
rem
rem Worth knowing: Vite hot-reloads source edits by itself, so a restart is only
rem needed after changing vite.config.ts, adding a dependency, or when the server
rem has genuinely wedged.

cd /d "%~dp0"

call "%~dp0stop.bat" quiet

echo.
echo Restarting...
echo.

call "%~dp0start.bat"
exit /b %errorlevel%
