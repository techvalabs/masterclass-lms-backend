@echo off
REM ===================================================
REM Real Estate Masterclass LMS - Database Migration
REM Run this from Windows Command Prompt or PowerShell
REM ===================================================

echo.
echo ========================================
echo Real Estate Masterclass LMS
echo Database Migration Tool
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ERROR: Not in the backend directory
    echo Please run this from: C:\laragon\www\masterclass-lms\backend
    pause
    exit /b 1
)

REM Display menu
:menu
echo What would you like to do?
echo.
echo 1. Validate migration files (no database required)
echo 2. Run all pending migrations
echo 3. Check migration status
echo 4. Seed development data
echo 5. Generate sample import files
echo 6. Create database (if not exists)
echo 7. Run complete setup (create + migrate + seed)
echo 8. View setup guide
echo 9. Exit
echo.

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto validate
if "%choice%"=="2" goto migrate
if "%choice%"=="3" goto status
if "%choice%"=="4" goto seed
if "%choice%"=="5" goto sample
if "%choice%"=="6" goto createdb
if "%choice%"=="7" goto fullsetup
if "%choice%"=="8" goto guide
if "%choice%"=="9" goto end

echo Invalid choice. Please try again.
echo.
goto menu

:validate
echo.
echo Validating migration files...
echo ========================================
call npm run migrate:validate
echo.
pause
goto menu

:migrate
echo.
echo Running database migrations...
echo ========================================
call npm run migrate
echo.
pause
goto menu

:status
echo.
echo Checking migration status...
echo ========================================
call npm run migrate:status
echo.
pause
goto menu

:seed
echo.
echo Seeding development data...
echo ========================================
call npm run migrate:seed
echo.
pause
goto menu

:sample
echo.
echo Generating sample import files...
echo ========================================
call npm run import:sample
echo.
echo Sample files created in: database\imports\
echo.
pause
goto menu

:createdb
echo.
echo Creating database (if not exists)...
echo ========================================
echo.
echo This will create: masterclass_lms
echo.
mysql -u root -e "CREATE DATABASE IF NOT EXISTS masterclass_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %ERRORLEVEL% EQU 0 (
    echo Database created successfully!
) else (
    echo Failed to create database. Please check MySQL is running in Laragon.
)
echo.
pause
goto menu

:fullsetup
echo.
echo Running complete database setup...
echo ========================================
echo This will:
echo 1. Create database (if not exists)
echo 2. Run all migrations
echo 3. Seed development data
echo.
set /p confirm="Are you sure? (y/n): "
if /i not "%confirm%"=="y" goto menu

echo.
echo Step 1: Creating database...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS masterclass_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo.
echo Step 2: Running migrations...
call npm run migrate

echo.
echo Step 3: Seeding data...
call npm run migrate:seed

echo.
echo ========================================
echo Setup complete!
echo ========================================
echo.
pause
goto menu

:guide
echo.
echo ========================================
echo SETUP GUIDE
echo ========================================
echo.
echo Prerequisites:
echo - Laragon with MySQL running
echo - Node.js installed on Windows
echo - npm packages installed (npm install)
echo.
echo Common Issues:
echo.
echo 1. "Host not allowed" error:
echo    - MySQL needs to allow connections from your IP
echo    - Run migrations from Windows (this script)
echo    - Or configure MySQL to allow WSL connections
echo.
echo 2. "Database not found" error:
echo    - Choose option 6 to create the database
echo    - Or create manually in phpMyAdmin
echo.
echo 3. "Command not found" error:
echo    - Make sure Node.js is installed
echo    - Run: npm install
echo.
echo For detailed help, see:
echo - database\SETUP_GUIDE.md
echo - database\README.md
echo.
pause
goto menu

:end
echo.
echo Goodbye!
exit /b 0