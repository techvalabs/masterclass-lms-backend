# ===================================================
# Real Estate Masterclass LMS - Database Migration
# PowerShell Script for Windows
# ===================================================

Write-Host ""
Write-Host "========================================"
Write-Host "Real Estate Masterclass LMS" -ForegroundColor Cyan
Write-Host "Database Migration Tool" -ForegroundColor Cyan
Write-Host "========================================"
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/"
    pause
    exit 1
}

# Check if we're in the correct directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Not in the backend directory" -ForegroundColor Red
    Write-Host "Please run this from: C:\laragon\www\masterclass-lms\backend"
    pause
    exit 1
}

function Show-Menu {
    Write-Host ""
    Write-Host "What would you like to do?" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Validate migration files (no database required)"
    Write-Host "2. Run all pending migrations"
    Write-Host "3. Check migration status"
    Write-Host "4. Seed development data"
    Write-Host "5. Generate sample import files"
    Write-Host "6. Create database (if not exists)"
    Write-Host "7. Run complete setup (create + migrate + seed)"
    Write-Host "8. Run manual SQL in phpMyAdmin"
    Write-Host "9. Test database connection"
    Write-Host "0. Exit"
    Write-Host ""
}

function Test-DatabaseConnection {
    Write-Host ""
    Write-Host "Testing database connection..." -ForegroundColor Yellow
    Write-Host "========================================"
    
    $testQuery = "SELECT 1;"
    try {
        mysql -u root -e $testQuery 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database connection successful!" -ForegroundColor Green
            Write-Host "MySQL is running and accessible" -ForegroundColor Green
        } else {
            Write-Host "❌ Database connection failed!" -ForegroundColor Red
            Write-Host "Please check if MySQL is running in Laragon" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ MySQL command not found" -ForegroundColor Red
        Write-Host "Please make sure Laragon MySQL is in your PATH" -ForegroundColor Yellow
    }
}

function Run-Migration {
    param($command, $description)
    
    Write-Host ""
    Write-Host $description -ForegroundColor Yellow
    Write-Host "========================================"
    
    npm run $command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ $description completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ $description failed. See error above." -ForegroundColor Red
    }
}

function Create-Database {
    Write-Host ""
    Write-Host "Creating database (if not exists)..." -ForegroundColor Yellow
    Write-Host "========================================"
    
    $createQuery = "CREATE DATABASE IF NOT EXISTS masterclass_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    
    mysql -u root -e $createQuery
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database." -ForegroundColor Red
        Write-Host "Please check if MySQL is running in Laragon" -ForegroundColor Yellow
    }
}

function Run-CompleteSetup {
    Write-Host ""
    Write-Host "Running complete database setup..." -ForegroundColor Cyan
    Write-Host "========================================"
    Write-Host "This will:"
    Write-Host "1. Create database (if not exists)"
    Write-Host "2. Run all migrations"
    Write-Host "3. Seed development data"
    Write-Host ""
    
    $confirm = Read-Host "Are you sure? (y/n)"
    if ($confirm -ne 'y') {
        return
    }
    
    Write-Host ""
    Write-Host "Step 1: Creating database..." -ForegroundColor Yellow
    Create-Database
    
    Write-Host ""
    Write-Host "Step 2: Running migrations..." -ForegroundColor Yellow
    npm run migrate
    
    Write-Host ""
    Write-Host "Step 3: Seeding data..." -ForegroundColor Yellow
    npm run migrate:seed
    
    Write-Host ""
    Write-Host "========================================"
    Write-Host "✅ Setup complete!" -ForegroundColor Green
    Write-Host "========================================"
}

function Open-PhpMyAdmin {
    Write-Host ""
    Write-Host "Opening phpMyAdmin..." -ForegroundColor Yellow
    Write-Host "========================================"
    Write-Host ""
    Write-Host "To run migrations manually:"
    Write-Host "1. Open phpMyAdmin at: http://localhost/phpmyadmin" -ForegroundColor Cyan
    Write-Host "2. Select/Create database: masterclass_lms"
    Write-Host "3. Go to SQL tab"
    Write-Host "4. Copy and paste content from these files in order:"
    Write-Host ""
    Write-Host "   a) database\migrations\001_create_initial_schema.sql" -ForegroundColor Yellow
    Write-Host "   b) database\migrations\002_insert_initial_data.sql" -ForegroundColor Yellow
    Write-Host "   c) database\migrations\003_seed_realistic_data.sql" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or use the combined file:"
    Write-Host "   database\MANUAL_SETUP.sql" -ForegroundColor Green
    Write-Host ""
    
    # Try to open phpMyAdmin in browser
    Start-Process "http://localhost/phpmyadmin"
}

# Main loop
while ($true) {
    Show-Menu
    $choice = Read-Host "Enter your choice (0-9)"
    
    switch ($choice) {
        "1" { Run-Migration "migrate:validate" "Validating migration files" }
        "2" { Run-Migration "migrate" "Running database migrations" }
        "3" { Run-Migration "migrate:status" "Checking migration status" }
        "4" { Run-Migration "migrate:seed" "Seeding development data" }
        "5" { 
            Run-Migration "import:sample" "Generating sample import files"
            Write-Host ""
            Write-Host "Sample files created in: database\imports\" -ForegroundColor Green
        }
        "6" { Create-Database }
        "7" { Run-CompleteSetup }
        "8" { Open-PhpMyAdmin }
        "9" { Test-DatabaseConnection }
        "0" { 
            Write-Host ""
            Write-Host "Goodbye!" -ForegroundColor Cyan
            exit 0
        }
        default {
            Write-Host ""
            Write-Host "Invalid choice. Please try again." -ForegroundColor Red
        }
    }
    
    Write-Host ""
    pause
}