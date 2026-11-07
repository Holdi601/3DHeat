@echo off
setlocal enabledelayedexpansion
title 3DHeat - stop

rem Stop whatever is serving on port 5273.
rem
rem Kills by port rather than by image name on purpose: `taskkill /im node.exe`
rem would take down every other Node process on the machine, which is rarely what
rem anyone means.

set "PORT=5273"
set "FOUND="

for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:"LISTENING" ^| findstr /c:":%PORT% "') do (
  if not "%%p"=="0" (
    rem netstat lists one line per address family, so the same pid can repeat.
    if "!KILLED_%%p!"=="" (
      set "KILLED_%%p=1"
      set "FOUND=1"
      for /f "tokens=1,2 delims=," %%a in ('tasklist /fi "pid eq %%p" /fo csv /nh 2^>nul') do (
        echo Stopping %%a on pid %%p
      )
      taskkill /f /t /pid %%p >nul 2>nul
      if errorlevel 1 echo   could not stop pid %%p - try running this as administrator
    )
  )
)

if not defined FOUND (
  echo Nothing is listening on port %PORT%.
) else (
  rem Give the socket a moment to be released, so a start.bat right after this
  rem does not trip its own port check. `ping` rather than `timeout`, because
  rem `timeout` refuses to run when stdin is redirected — which is exactly what
  rem happens when this is called from another script or from CI.
  ping -n 3 127.0.0.1 >nul 2>nul
  echo Done.
)

if /i not "%~1"=="quiet" pause
exit /b 0
