# 🚀 Quick Start - Database Setup

## ✅ **Option 1: Run from Windows (RECOMMENDED)**

Since you're using Laragon on Windows, the easiest way is to run migrations directly from Windows:

### Using Batch File (Easy)
```cmd
# Open Command Prompt in backend folder
cd C:\laragon\www\masterclass-lms\backend

# Run the migration tool
run-migrations.bat

# Choose option 7 for complete setup
```

### Using PowerShell (More Features)
```powershell
# Open PowerShell in backend folder  
cd C:\laragon\www\masterclass-lms\backend

# Allow script execution (first time only)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the migration tool
.\run-migrations.ps1

# Choose option 7 for complete setup
```

### Direct Commands
```cmd
# From Windows Command Prompt:
cd C:\laragon\www\masterclass-lms\backend

# Validate files (no database needed)
npm run migrate:validate

# Run migrations
npm run migrate

# Seed data
npm run migrate:seed
```

## ✅ **Option 2: Manual Setup in phpMyAdmin**

1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Create database: `masterclass_lms`
3. Select the database
4. Go to SQL tab
5. Copy and paste the content from:
   - `database/MANUAL_SETUP.sql` (contains everything)
   
   OR run these files in order:
   - `database/migrations/001_create_initial_schema.sql`
   - `database/migrations/002_insert_initial_data.sql`
   - `database/migrations/003_seed_realistic_data.sql`

## ✅ **Option 3: Fix WSL Connection (Advanced)**

If you want to run from WSL, you need to configure MySQL:

1. **Open Laragon → MySQL → my.ini**
2. **Add under `[mysqld]`:**
   ```ini
   bind-address = 0.0.0.0
   ```
3. **Restart Laragon**
4. **Open Laragon Terminal:**
   ```sql
   mysql -u root
   CREATE USER 'root'@'%' IDENTIFIED BY '';
   GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
   FLUSH PRIVILEGES;
   ```

## 📋 **What Gets Created**

After successful setup, you'll have:

### Database Structure
- **30+ tables** for complete LMS functionality
- **Proper indexes** and foreign keys
- **Optimized** for performance

### Sample Data
- **1 Admin user** (admin@realestate-masterclass.com / Admin123!)
- **13 realistic users** (students and instructors)
- **8 complete courses** with real estate content
- **20+ enrollments** with progress tracking
- **Payment history** and course reviews
- **100+ system settings**

## 🎯 **Next Steps**

1. **Start the backend:**
   ```bash
   npm run dev
   ```

2. **Test the API:**
   - Health check: http://localhost:3001/api/admin/health
   - Dashboard: http://localhost:3001/api/admin/dashboard/stats

3. **Login credentials:**
   - Admin: admin@realestate-masterclass.com / Admin123!
   - Instructor: robert.smith@realestate-masterclass.com / Instructor123!
   - Student: sarah.johnson@example.com / Student123!

## ❓ **Troubleshooting**

### "Host not allowed" error
- You're running from WSL but MySQL doesn't allow WSL connections
- **Solution**: Run from Windows using the batch/PowerShell scripts

### "Database not found" error
- The database doesn't exist yet
- **Solution**: Create it first using option 6 in the migration tool

### "Command not found" error
- Node.js or npm packages not installed
- **Solution**: 
  ```bash
  npm install
  npm install csv-parser
  ```

### Migration files are valid but won't run
- Database connection issue
- **Solution**: Use manual setup in phpMyAdmin

## 📚 **More Information**

- Detailed setup guide: `database/SETUP_GUIDE.md`
- Database documentation: `database/README.md`
- Manual SQL file: `database/MANUAL_SETUP.sql`

---

**Need help?** The migration files are validated and ready. If automated migration fails, use the manual SQL setup - it's guaranteed to work!