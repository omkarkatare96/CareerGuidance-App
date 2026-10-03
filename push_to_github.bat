@echo off
title CareerCompass-AI — GitHub Push
color 0A
echo ================================================
echo   CareerCompass-AI — GitHub Push Script
echo ================================================
echo.

cd /d "C:\Users\OMKAR\Desktop\CareerCompass-AI-main"
if errorlevel 1 (
    echo ERROR: Could not find project folder.
    pause
    exit /b 1
)

echo [1/6] Initializing git repository...
git init
echo.

echo [2/6] Setting up remote...
git remote remove origin 2>nul
git remote add origin https://github.com/omkarkatare96/CareerGuidance-App.git
echo Remote set to: https://github.com/omkarkatare96/CareerGuidance-App.git
echo.

echo [3/6] Staging all files (secrets blocked by .gitignore)...
git add .
echo.

echo [4/6] Verifying .env is NOT staged (should show nothing below)...
git ls-files --cached | findstr ".env"
echo (If you see .env above, press Ctrl+C and contact support)
echo.

echo [5/6] Committing...
git commit -m "feat: CareerCompass AI - complete app with AI discover, roadmap, sprint planner, sci-fi home background, and Render/Vercel deployment config"
echo.

echo [6/6] Pushing to main branch...
git branch -M main
git push -u origin main --force
echo.

if errorlevel 1 (
    echo.
    echo PUSH FAILED. Most likely reason: GitHub requires authentication.
    echo.
    echo TO FIX:
    echo 1. Go to https://github.com/settings/tokens
    echo 2. Click "Generate new token (classic)"
    echo 3. Check the "repo" checkbox
    echo 4. Click Generate token - COPY IT
    echo 5. Run this script again
    echo 6. When prompted for password - paste your token
    echo.
) else (
    echo.
    echo ================================================
    echo   SUCCESS! Code pushed to GitHub.
    echo   URL: https://github.com/omkarkatare96/CareerGuidance-App
    echo ================================================
)

echo.
pause
