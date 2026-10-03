@echo off
setlocal

echo ==========================================
echo   CareerCoach AI - Starting...
echo ==========================================

:: 1. Kill existing processes to free ports
echo [1/5] Killing existing node and python processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im uvicorn.exe >nul 2>&1
echo Done.

:: 2. Delete .next/dev/lock if it exists
echo [2/5] Cleaning .next lock file...
set "LOCK_FILE=C:\Users\OMKAR\Desktop\GIT\CAREERCOACH ai\.next\dev\locks"
if exist "%LOCK_FILE%" (
    rmdir /s /q "%LOCK_FILE%"
    echo Lock removed.
) else (
    echo No lock found.
)

:: Also delete the lock file directly if present
set "DEV_LOCK=C:\Users\OMKAR\Desktop\GIT\CAREERCOACH ai\.next\dev"
if exist "%DEV_LOCK%\*.lock" del /f /q "%DEV_LOCK%\*.lock" >nul 2>&1

:: 3. Start Backend in a new visible terminal
echo [3/5] Starting Backend (FastAPI on :8000)...
start "CareerCoach Backend" cmd /k "cd /d "C:\Users\OMKAR\Desktop\GIT\CAREERCOACH ai\backend" && call venv\Scripts\activate && uvicorn main:app --reload"

:: 4. Wait 3 seconds
echo [4/5] Waiting 3 seconds for backend to init...
timeout /t 3 /nobreak >nul

:: 5. Start Frontend in a new visible terminal
echo [5/5] Starting Frontend (Next.js on :3000)...
start "CareerCoach Frontend" cmd /k "cd /d "C:\Users\OMKAR\Desktop\GIT\CAREERCOACH ai" && npm run dev"

echo.
echo ==========================================
echo   Backend on  :8000
echo   Frontend on :3000
echo   Close the opened terminal windows to stop.
echo ==========================================
pause