@echo off
echo ========================================
echo   IRFAM - Demarrage du Frontend React
echo ========================================
echo.
cd irfam_frontend
echo Configuration de Node.js...
set NODE_OPTIONS=--openssl-legacy-provider
echo.
echo Demarrage de l'application React...
npm start
pause
