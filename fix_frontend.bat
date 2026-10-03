@echo off
echo ===================================================
echo   FIX FRONTEND CONNECTION (Next.js Port 3000)
echo ===================================================

:: 1. Kill any process on port 3000
echo [1/4] Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

:: 2. Clean Cache
echo [2/4] Cleaning project cache (.next)...
if exist .next rmdir /s /q .next

:: 3. Clean Dependencies (Optional but recommended for "weird" errors)
echo [3/4] Cleaning node_modules (this might take a minute)...
if exist node_modules rmdir /s /q node_modules

:: 4. Reinstall and Start
echo [4/4] Reinstalling and starting...
call npm install
echo.
echo ===================================================
echo   Starting Next.js Dev Server...
echo   Please wait for "Ready in..." message.
echo ===================================================
npm run dev
