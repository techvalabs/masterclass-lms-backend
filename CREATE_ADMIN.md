# How to Create an Admin Account

## Option 1: Quick Method (Recommended)

Open Windows PowerShell and run:

```powershell
cd C:\laragon\www\masterclass-lms\backend
npm run admin:create
```

This will create an admin account with:
- Email: `admin@masterclass.com`
- Password: `Admin@123`
- Name: System Administrator

## Option 2: Custom Admin Account

Create admin with your own credentials:

```powershell
cd C:\laragon\www\masterclass-lms\backend
npx tsx scripts/create-admin.ts "your-email@example.com" "YourPassword123" "Your Name"
```

## Option 3: Convert Existing User to Admin

If you already have a registered account and want to make it admin:

```powershell
cd C:\laragon\www\masterclass-lms\backend
npx tsx scripts/create-admin.ts "your-existing-email@example.com"
```

This will upgrade your existing account to admin role.

## Option 4: Direct MySQL Update

If you prefer using MySQL directly:

```sql
-- Connect to MySQL
mysql -u root -p

-- Select database
USE masterclass_lms;

-- Update existing user to admin (role_id = 3)
UPDATE users SET role_id = 3 WHERE email = 'your-email@example.com';
```

## Testing Admin Dashboard

After creating your admin account:

1. Go to http://localhost:5174/login
2. Login with your admin credentials
3. You'll be redirected to the Admin Dashboard with full management capabilities:
   - User management
   - Course management
   - Payment settings
   - System monitoring
   - Content upload
   - Analytics

## Admin Dashboard Features

- **Total Users**: View and manage all registered users
- **Course Management**: Approve, edit, or delete courses
- **Revenue Tracking**: Monitor platform earnings
- **System Health**: Check database and server status
- **Quick Actions**: Direct access to all admin functions
- **Activity Monitoring**: Track recent platform activity

## Important Notes

- The first time you run `npm run admin:create`, it will also create the admin role in the database
- Change the default password immediately after first login for security
- Admin accounts have full access to all platform features
- Be careful with admin privileges - they can modify/delete any content