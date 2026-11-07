@echo off
setlocal
title 3DHeat - dev server

rem Start the tool. Double-click this, wait for "ready", then open the URL it
rem prints (or let it open the browser for you).
rem
rem This window has to stay open: it *is* the server. Close it, or press Ctrl+C,
rem to stop.

cd /d "%~dp0"

rem Node is often not on PATH in a fresh shell even when it is installed, so look
rem in the usual places before giving up.
where node >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
)
where node >nul 2>nul
if errorlevel 1 (
  if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
)
where node >nul 2>nul
if errorlevel 1 (
  if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"
)
rem Offer rather than refuse. "Install it yourself and come back" is a dead end
rem for anyone who was handed this tool rather than set it up.
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js is needed to run 3DHeat, and it was not found on this machine.
  echo   It is about 30 MB and installs from Microsoft's own package manager.
  echo.
  choice /c YN /m "Install Node.js now"
  if errorlevel 2 (
    echo.
    echo   Nothing was installed. You can get Node.js from nodejs.org
    echo   and then run start.bat again.
    echo.
    pause
    exit /b 1
  )
  winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
  if errorlevel 1 (
    echo.
    echo   The install did not finish. Nothing else was changed.
    echo.
    pause
    exit /b 1
  )
  echo.
  echo   Node.js installed. Close this window and run start.bat again, so Windows
  echo   picks up the new PATH.
  echo.
  pause
  exit /b 0
)

for /f "delims=" %%v in ('node --version') do set "NODEVER=%%v"
echo Node %NODEVER%

rem Up to date before starting. A copy that is a git checkout with nothing
rem changed locally is brought to the newest version of the branch it follows,
rem and says so; one with local changes is only told an update is waiting -
rem someone's own work is not an update's to overwrite.
where git >nul 2>nul
if not errorlevel 1 if exist ".git" call :selfupdate

rem Refuse to start a second server on the same port: two dev servers on 5273
rem means edits appear to do nothing, because the browser is talking to the old
rem one. Point at restart.bat rather than silently picking another port.
call :portcheck
if errorlevel 1 (
  echo.
  echo   Something is already listening on port %PORT%.
  echo   Run restart.bat to stop it and start fresh, or stop.bat to just stop it.
  echo.
  pause
  exit /b 1
)

rem Asked, not assumed. This downloads a few hundred megabytes into the project
rem folder, and doing that to someone's machine without telling them first is not
rem ours to decide — however convenient it would be.
if not exist "node_modules" (
  echo.
  echo   First run: 3DHeat needs its dependencies downloading.
  echo.
  echo     - about 300 MB, into node_modules\ inside this folder
  echo     - nothing is installed system-wide
  echo     - takes a few minutes
  echo.
  choice /c YN /m "Download them now"
  if errorlevel 2 (
    echo.
    echo   Nothing was downloaded. 3DHeat cannot start without them.
    echo.
    pause
    exit /b 1
  )
  call npm install
  if errorlevel 1 (
    echo.
    echo   The download failed. The output above says why. Nothing else changed.
    echo.
    pause
    exit /b 1
  )
)

echo.
echo Starting the dev server. Leave this window open.
echo Open http://127.0.0.1:%PORT%/ when it says ready.
echo.

rem `start ""` with a delay would race the server; vite prints the URL itself and
rem --open hands the timing to it.
call npm run dev -- --host 127.0.0.1 --port %PORT% --strictPort --open

rem Only reached once the server exits.
echo.
echo Server stopped.
pause
exit /b 0

:selfupdate
set "BEHIND="
set "AHEAD="
set "REINSTALL="
git fetch --quiet >nul 2>nul
if errorlevel 1 exit /b 0
for /f %%n in ('git rev-list --count HEAD..@{u} 2^>nul') do set "BEHIND=%%n"
if not defined BEHIND exit /b 0
if "%BEHIND%"=="0" exit /b 0
for /f "delims=" %%s in ('git status --porcelain --untracked-files^=no') do (
  echo.
  echo   A newer version of 3DHeat is available ^(%BEHIND% changes^), but this copy has
  echo   local changes, so it is not updated. Commit or stash them, then run git pull.
  echo.
  exit /b 0
)
rem Commits of its own the newest version does not have: a fast-forward cannot
rem bring it up, and merging is someone's decision, not an update's. Said the
rem way the page's update notice says it.
for /f %%n in ('git rev-list --count @{u}..HEAD 2^>nul') do set "AHEAD=%%n"
if defined AHEAD if not "%AHEAD%"=="0" (
  echo.
  echo   A newer version of 3DHeat is available ^(%BEHIND% changes^), but this copy has
  echo   commits of its own that the newest version does not, so it is not updated.
  echo   Update it with git pull.
  echo.
  exit /b 0
)
echo.
echo   A newer version of 3DHeat is available ^(%BEHIND% changes^).
rem Nothing changes on this machine without the user's yes; no answer in 60 s keeps this version.
choice /c YN /n /t 60 /d N /m "  Update now? [Y/N] "
if errorlevel 2 (
  echo   Not updated; starting the version you have.
  echo.
  exit /b 0
)
echo   Updating...
git diff --name-only HEAD @{u} | findstr /i /x "package.json package-lock.json" >nul && set "REINSTALL=1"
git pull --ff-only
if errorlevel 1 (
  echo   The update did not go through; starting the version you have.
  exit /b 0
)
git submodule update --init >nul 2>nul
if defined REINSTALL if exist "node_modules" call npm install
echo   Updated.
echo.
exit /b 0

:portcheck
set "PORT=5273"
netstat -ano | findstr /r /c:"LISTENING" | findstr /c:":%PORT% " >nul 2>nul
if errorlevel 1 exit /b 0
exit /b 1
