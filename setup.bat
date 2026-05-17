@echo off
echo.
echo  ========================================
echo    CHAIN WATCHER - First Time Setup
echo  ========================================
echo.
echo  Installing dependencies...
echo  This may take 1-2 minutes.
echo.
call npm install
echo.
if %ERRORLEVEL% EQU 0 (
    echo  ========================================
    echo    Setup Complete!
    echo  ========================================
    echo.
    echo  To launch Chain Watcher, double-click:
    echo    start.bat
    echo.
    echo  Or run: npm start
    echo.
) else (
    echo  ========================================
    echo    Setup Failed
    echo  ========================================
    echo.
    echo  Make sure Node.js is installed:
    echo    https://nodejs.org/
    echo.
    echo  Download the LTS version, install it,
    echo  then run this setup again.
    echo.
)
pause
