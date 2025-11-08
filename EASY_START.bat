@echo off
echo.
echo ========================================
echo   URBAN Platform - Easy Setup
echo ========================================
echo.

echo OPTION 1: Install Docker Desktop (Recommended)
echo.
echo 1. Download from: https://www.docker.com/products/docker-desktop/
echo 2. Run the installer
echo 3. Restart your computer
echo 4. Start Docker Desktop
echo 5. Run this script again
echo.
echo Press 1 to open download page, or press any other key to see alternatives
echo.
choice /c 1234567890 /n /t 30 /d 0 /m ""
if errorlevel 1 start https://www.docker.com/products/docker-desktop/

echo.
echo ========================================
echo   Alternative: Use Cloud Services (Free)
echo ========================================
echo.
echo You can use free cloud services instead of local databases:
echo.
echo PostgreSQL (Choose one):
echo   - Supabase: https://supabase.com (Recommended)
echo   - Neon: https://neon.tech
echo   - ElephantSQL: https://www.elephantsql.com
echo.
echo Redis:
echo   - Upstash: https://upstash.com (Recommended)
echo.
echo After signing up, update backend\.env with your connection strings:
echo   DATABASE_URL=postgresql://user:pass@host:5432/dbname
echo   REDIS_URL=redis://host:port
echo.
echo Press any key to continue...
pause >nul

echo.
echo ========================================
echo   Check What's Installed
echo ========================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js installed
) else (
    echo [X] Node.js not found - Install from: https://nodejs.org
)

if exist node_modules (
    echo [OK] Dependencies installed
) else (
    echo [X] Dependencies missing - Run: npm install
)

if exist backend\.env (
    echo [OK] Backend .env configured
) else (
    echo [X] Backend .env missing
)

if exist frontend\.env (
    echo [OK] Frontend .env configured
) else (
    echo [X] Frontend .env missing
)

echo.
echo ========================================
echo   Your API Keys (Already Configured)
echo ========================================
echo.
echo Gemini API: AIzaSyDaS8rk8Yjkch6SH6q68v0rBXc9CTZtFuo
echo Mapbox: pk.eyJ1Ijoic2hyeXVrZyIs...
echo Census: 9295d7ce67bb1592828db3723cc61a106f815103
echo.
echo ========================================
echo.

echo For detailed instructions, see:
echo   - WINDOWS_SETUP.md
echo   - START_HERE.md
echo.
pause


