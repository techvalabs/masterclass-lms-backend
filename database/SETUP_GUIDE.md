# Database Setup Guide - Real Estate Masterclass LMS

## Quick Start (Database Connection Issues)

If you're encountering MySQL connection issues from WSL to Laragon, here are the solutions:

### ✅ **Option 1: Validate Migration Files (Works Without Database)**

Test that your migration files are valid:

```bash
npm run migrate:validate
```

This validates all SQL files without requiring a database connection.

### ✅ **Option 2: Fix WSL → Laragon MySQL Connection**

#### Step 1: Configure MySQL to Accept WSL Connections

1. **Open Laragon MySQL Configuration:**
   - Open Laragon
   - Click "MySQL" → "my.ini" or go to `C:\laragon\bin\mysql\mysql-8.x.x\my.ini`

2. **Add/Update these lines in the `[mysqld]` section:**
   ```ini
   [mysqld]
   bind-address = 0.0.0.0
   skip-name-resolve
   ```

3. **Restart MySQL in Laragon:**
   - Laragon → Stop All → Start All

#### Step 2: Create MySQL User for WSL Access

1. **Open Laragon Terminal (or MySQL CLI):**
   ```sql
   -- Connect to MySQL as root
   mysql -u root -p
   
   -- Create user that can connect from WSL IP range
   CREATE USER 'root'@'172.23.%' IDENTIFIED BY '';
   GRANT ALL PRIVILEGES ON *.* TO 'root'@'172.23.%' WITH GRANT OPTION;
   
   -- Alternative: Allow from any IP (less secure)
   CREATE USER 'root'@'%' IDENTIFIED BY '';
   GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
   
   FLUSH PRIVILEGES;
   ```

#### Step 3: Test Connection from WSL

```bash
# Test database connection
npm run migrate:validate  # Should work
npm run migrate          # Should now work
```

### ✅ **Option 3: Use MySQL via Windows (Alternative)**

If WSL connection still fails, run migrations directly from Windows:

1. **Install Node.js on Windows**
2. **Copy the database utilities to Windows**
3. **Run from Windows Command Prompt:**
   ```cmd
   cd C:\laragon\www\masterclass-lms\backend
   node database\utilities\migration-runner.js migrate
   ```

### ✅ **Option 4: Manual SQL Execution**

If automated migrations still don't work:

1. **Copy SQL content from migration files**
2. **Execute manually in Laragon → MySQL → phpMyAdmin or HeidiSQL**

```sql
-- Create database first
CREATE DATABASE IF NOT EXISTS masterclass_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE masterclass_lms;

-- Then copy and paste content from:
-- 1. database/migrations/001_create_initial_schema.sql
-- 2. database/migrations/002_insert_initial_data.sql  
-- 3. database/migrations/003_seed_realistic_data.sql
```

## Migration Commands Reference

```bash
# Validate migration files (no database required)
npm run migrate:validate

# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Seed development data
npm run migrate:seed

# Reset database (careful!)
npm run migrate:reset

# Generate sample import files
npm run import:sample

# Import users from CSV
npm run import:users users.csv

# Import courses from JSON
npm run import:courses courses.json
```

## Database Structure Overview

After running migrations, you'll have:

### Core Tables (30+)
- **Users & Authentication**: `users`, `roles`, `user_sessions`
- **Courses**: `courses`, `course_lessons`, `course_categories`
- **Learning**: `enrollments`, `lesson_progress`, `quiz_attempts`
- **Payments**: `payment_transactions`, `instructor_earnings`, `coupons`
- **Content**: `course_reviews`, `certificates`, `notifications`
- **Analytics**: `activity_logs`, `system_settings`

### Sample Data Included
- **13 realistic users** (students, instructors)
- **8 comprehensive courses** with real estate content
- **20+ enrollments** with progress tracking
- **Payment history** and reviews
- **Complete admin dashboard data**

## Troubleshooting

### Connection Refused (ECONNREFUSED)
- Check if MySQL is running in Laragon
- Verify WSL can reach Windows host: `ping 172.23.160.1`
- Try alternative IPs: `10.255.255.254`, `172.20.240.1`

### Host Not Allowed
- MySQL user permissions issue
- Follow Option 2 above to fix user permissions

### File Not Found
- Ensure you're in the correct directory: `/mnt/c/laragon/www/masterclass-lms/backend`
- Check migration files exist: `ls database/migrations/`

### WSL IP Changes
- WSL IP can change between reboots
- Check current IP: `ip route show | grep default`
- Update `.env` file if needed

## Production Deployment

For production deployment:

1. **Update environment variables**:
   ```bash
   DB_HOST=your_production_host
   DB_USER=your_production_user
   DB_PASSWORD=your_secure_password
   ```

2. **Run migrations**:
   ```bash
   npm run migrate
   ```

3. **Import production data**:
   ```bash
   npm run import:users production-users.csv
   npm run import:courses production-courses.json
   ```

## Next Steps

Once your database is set up:

1. **Start the backend server**: `npm run dev`
2. **Test API endpoints**: Visit `http://localhost:3001/api/admin/health`
3. **Access admin dashboard**: Login with default admin credentials
4. **Add real content**: Replace seed data with production content

---

Need help? Check the main README.md or contact the development team.