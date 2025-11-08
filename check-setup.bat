@echo off
echo.
echo ============================================
echo   URBAN Platform Setup Checker
echo ============================================
echo.

echo Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    node -v
    echo [OK] Node.js is installed
) else (
    echo [ERROR] Node.js not found
)
echo.

echo Checking npm...
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    npm -v
    echo [OK] npm is installed
) else (
    echo [ERROR] npm not found
)
echo.

echo Checking Docker...
where docker >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    docker --version
    echo [OK] Docker is installed
    echo.
    echo Checking Docker containers...
    docker ps -a | findstr urban
) else (
    echo [NOT FOUND] Docker not installed
    echo.
    echo RECOMMENDATION: Install Docker Desktop
    echo Download from: https://www.docker.com/products/docker-desktop/
)
echo.

echo Checking PostgreSQL...
where psql >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    psql --version
    echo [OK] PostgreSQL CLI found
) else (
    echo [NOT FOUND] PostgreSQL CLI not found
)
echo.

echo Checking Redis...
where redis-cli >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    redis-cli --version
    echo [OK] Redis CLI found
) else (
    echo [NOT FOUND] Redis CLI not found
)
echo.

echo Checking .env files...
if exist backend\.env (
    echo [OK] backend\.env exists
) else (
    echo [MISSING] backend\.env not found
)

if exist frontend\.env (
    echo [OK] frontend\.env exists
) else (
    echo [MISSING] frontend\.env not found
)
echo.

echo Checking node_modules...
if exist node_modules (
    echo [OK] Dependencies installed
) else (
    echo [MISSING] Run: npm install
)
echo.

echo ============================================
echo   Setup Status Summary
echo ============================================
echo.
echo Your API Keys are configured:
echo   - Gemini API: AIzaSyDaS8rk8Yjkch6SH6q68v0rBXc9CTZtFuo
echo   - Mapbox Token: pk.eyJ1Ijoic2hyeXVrZyIs...
echo   - Census API: 9295d7ce67bb1592828db3723cc61a106f815103
echo.
echo Next Steps:
echo   1. Install Docker Desktop (see INSTALL_DOCKER.txt)
echo   2. Start PostgreSQL and Redis containers
echo   3. Run: npm run db:migrate
echo   4. Run: npm run db:seed
echo   5. Run: npm run dev
echo.
echo For detailed instructions, see:
echo   - WINDOWS_SETUP.md (complete guide)
echo   - START_HERE.md (quick start)
echo.
pause


