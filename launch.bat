@echo off
echo ========================================================
echo   AEROLUX AIRFIELD & GROUND OPERATIONS MANAGEMENT SYSTEM
echo ========================================================
echo.
echo Launching application in default browser...
start "" "%~dp0index.html"
echo.
echo If your browser blocks local image loading via file://,
echo you can run PowerShell local server by running:
echo   powershell -ExecutionPolicy Bypass -File .\serve.ps1
echo.
