@echo off
REM RabuSore Diff - Local Server Launcher (Windows)
REM This script will build and serve the app locally

echo.
echo ================================
echo RabuSore Diff - Local Server
echo ================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if out directory exists
if not exist "out" (
    echo Building static export...
    call npm run export
    echo.
)

echo Starting local server on http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

npx serve@latest out -l 3000
