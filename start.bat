@echo off
echo Starting San Manager...

start "Backend" cmd /k "cd /d %~dp0backend && npm run dev"
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Both servers started in separate windows.
