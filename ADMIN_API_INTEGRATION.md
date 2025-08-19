# Real Estate Masterclass LMS - Admin API Integration Guide

## Overview

This document provides a comprehensive guide for integrating the complete MVC (Model-View-Controller) backend API with the admin dashboard frontend. The backend implements all required API endpoints following REST conventions with proper authentication, validation, and error handling.

## 🚀 Quick Start

### 1. Database Setup

First, run the database schema and admin tables:

```bash
# Navigate to backend directory
cd /mnt/c/laragon/www/masterclass-lms/backend

# Create main database schema
mysql -u root -p masterclass_lms < database/schema.sql

# Add admin-specific tables
mysql -u root -p masterclass_lms < database/admin-tables.sql
```

### 2. Install Dependencies

```bash
npm install multer sharp fluent-ffmpeg
```

### 3. Environment Variables

Ensure your `.env` file includes:

```env
# Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=masterclass_lms

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here_change_this_in_production

# File Upload
MAX_FILE_SIZE=104857600
UPLOAD_PATH=./uploads

# Application
NODE_ENV=development
APP_VERSION=1.0.0
```

### 4. Start Server

```bash
npm run dev
# or
node src/server-mysql.ts
```

## 📋 Complete API Endpoints

### Authentication
All admin endpoints require authentication with admin role. Include in headers:
```
Authorization: Bearer {admin_access_token}
```

### Base URL
```
http://localhost:3001/api/admin
```

## 🎓 Courses Management API

### List Courses
```http
GET /api/admin/courses
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sort` (string): Sort field (created_at, title, price, etc.)
- `order` (string): Sort order (asc, desc)
- `status` (string): published, draft, pending, rejected
- `instructor` (string): Search by instructor name/email
- `category` (string): Filter by category
- `search` (string): Search in title/description
- `level` (string): Beginner, Intermediate, Advanced
- `priceMin` (number): Minimum price filter
- `priceMax` (number): Maximum price filter
- `dateFrom` (string): Date range start (YYYY-MM-DD)
- `dateTo` (string): Date range end (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Real Estate Investing Basics",
      "slug": "real-estate-investing-basics",
      "description": "Learn the fundamentals...",
      "price": 299.99,
      "level": "Beginner",
      "isPublished": true,
      "isFeatured": false,
      "instructor": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "category": {
        "id": 1,
        "name": "Real Estate Wholesaling"
      },
      "stats": {
        "activeEnrollments": 150,
        "completions": 45,
        "totalRevenue": 44998.50,
        "completionRate": 30
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 145,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Create Course
```http
POST /api/admin/courses
```

**Body:**
```json
{
  "title": "Advanced Real Estate Strategies",
  "description": "Master advanced techniques...",
  "shortDescription": "Advanced real estate course",
  "instructorId": 2,
  "categoryId": 1,
  "price": 499.99,
  "originalPrice": 699.99,
  "level": "Advanced",
  "durationHours": 10,
  "durationMinutes": 30,
  "language": "en",
  "tags": ["real-estate", "advanced", "investing"],
  "learningOutcomes": [
    "Master advanced negotiation techniques",
    "Understand complex financing options"
  ],
  "requirements": [
    "Basic real estate knowledge required"
  ],
  "isPublished": false,
  "isFeatured": true
}
```

### Bulk Actions
```http
POST /api/admin/courses/bulk-action
```

**Body:**
```json
{
  "action": "publish", // delete, archive, publish, unpublish, feature, unfeature
  "courseIds": [1, 2, 3, 4]
}
```

## 👥 Users Management API

### List Users
```http
GET /api/admin/users
```

**Query Parameters:**
- `page`, `limit`, `sort`, `order` (pagination)
- `role` (string): Filter by role (student, instructor, admin)
- `status` (string): active, inactive, all
- `search` (string): Search name/email/phone
- `verified` (string): true, false, all
- `dateFrom`, `dateTo` (date filters)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": {
        "id": 1,
        "name": "student",
        "description": "Student role"
      },
      "emailVerified": true,
      "isActive": true,
      "lastLogin": "2024-01-15T14:30:00Z",
      "stats": {
        "totalEnrollments": 5,
        "completedCourses": 2,
        "totalSpent": 899.97,
        "completionRate": 40
      },
      "createdAt": "2024-01-10T09:15:00Z"
    }
  ],
  "meta": { /* pagination info */ }
}
```

### Bulk Email
```http
POST /api/admin/users/bulk-email
```

**Body:**
```json
{
  "recipients": "role", // all, role, specific
  "roleId": 1, // for role-based emails
  "userIds": [1, 2, 3], // for specific users
  "subject": "Important Course Update",
  "message": "We have exciting news about your courses...",
  "template": "course_update"
}
```

### Bulk User Actions
```http
POST /api/admin/users/bulk-action
```

**Body:**
```json
{
  "action": "activate", // activate, deactivate, delete, verify, change_role
  "userIds": [1, 2, 3],
  "roleId": 2 // required for change_role action
}
```

## 📊 Analytics API

### Dashboard Overview
```http
GET /api/admin/analytics/overview?period=month
```

**Query Parameters:**
- `period` (string): today, week, month, quarter, year, custom
- `startDate`, `endDate` (for custom period)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": {
        "current": 1250,
        "previous": 1180,
        "change": 6
      },
      "totalCourses": {
        "current": 45,
        "previous": 42,
        "change": 7
      },
      "totalRevenue": {
        "current": 125000.50,
        "previous": 98000.25,
        "change": 28
      },
      "activeStudents": {
        "current": 890,
        "previous": 820,
        "change": 9
      }
    },
    "recentActivities": [
      {
        "action": "course_created",
        "description": "New course 'Advanced Flipping' created",
        "createdAt": "2024-01-15T16:45:00Z",
        "user": {
          "name": "Admin User"
        }
      }
    ],
    "topCourses": [
      {
        "id": 1,
        "title": "Real Estate Basics",
        "enrollments": 150,
        "revenue": 44850.00,
        "rating": 4.8
      }
    ],
    "userGrowth": [
      {
        "date": "2024-01-01",
        "newUsers": 15
      }
    ],
    "revenueData": [
      {
        "date": "2024-01-01",
        "revenue": 2500.00,
        "transactions": 8
      }
    ]
  }
}
```

### Export Analytics
```http
GET /api/admin/analytics/export?type=revenue&format=csv&period=month
```

**Query Parameters:**
- `type` (string): overview, revenue, users, courses
- `format` (string): json, csv
- `period` (string): time period

## 💳 Payments API

### List Transactions
```http
GET /api/admin/payments/transactions
```

**Query Parameters:**
- Standard pagination parameters
- `status` (string): pending, completed, failed, refunded
- `paymentMethod` (string): stripe, paypal, razorpay, manual
- `amountMin`, `amountMax` (number): Amount filters
- `search` (string): Search transactions

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "transactionId": "txn_1234567890",
      "amount": 299.99,
      "currency": "USD",
      "status": "completed",
      "paymentMethod": "stripe",
      "paymentDate": "2024-01-15T12:00:00Z",
      "user": {
        "name": "John Smith",
        "email": "john@example.com"
      },
      "course": {
        "title": "Real Estate Basics",
        "price": 299.99
      },
      "refunds": {
        "count": 0,
        "amount": 0
      }
    }
  ]
}
```

### Process Refund
```http
POST /api/admin/payments/refund
```

**Body:**
```json
{
  "transactionId": 1,
  "amount": 299.99,
  "reason": "customer_request", // customer_request, fraud, duplicate, other
  "description": "Customer requested refund due to course quality issues"
}
```

### Manage Coupons
```http
GET /api/admin/payments/coupons
POST /api/admin/payments/coupons
PUT /api/admin/payments/coupons/:id
DELETE /api/admin/payments/coupons/:id
```

**Create Coupon Body:**
```json
{
  "code": "SAVE20",
  "name": "20% Off New Year Sale",
  "description": "Special discount for new year",
  "type": "percentage", // percentage, fixed_amount
  "value": 20,
  "minimumAmount": 100,
  "maximumDiscount": 50,
  "usageLimit": 100,
  "usageLimitPerUser": 1,
  "applicableCourses": [1, 2, 3],
  "startsAt": "2024-01-01T00:00:00Z",
  "expiresAt": "2024-01-31T23:59:59Z",
  "isActive": true
}
```

## 📁 Content Management API

### Upload Files
```http
POST /api/admin/content/upload
Content-Type: multipart/form-data
```

**Form Data:**
- `files[]` (File[]): Multiple files (max 10)
- `entityType` (string): course, lesson, user (optional)
- `entityId` (number): Related entity ID (optional)
- `altText` (string): Alt text for images (optional)
- `title` (string): File title (optional)
- `description` (string): File description (optional)

**Response:**
```json
{
  "success": true,
  "message": "Successfully uploaded 2 file(s)",
  "data": [
    {
      "id": 1,
      "originalName": "course-thumbnail.jpg",
      "fileName": "course_thumbnail_1641902400000_abc123.jpg",
      "fileSize": 245760,
      "mimeType": "image/jpeg",
      "fileType": "image",
      "publicUrl": "/uploads/2024/01/course_thumbnail_1641902400000_abc123.jpg",
      "dimensions": {
        "width": 800,
        "height": 600
      }
    }
  ]
}
```

### List Files
```http
GET /api/admin/content/files
```

**Query Parameters:**
- Standard pagination
- `fileType` (string): image, video, audio, document, archive, other
- `entityType` (string): Filter by entity type
- `entityId` (number): Filter by entity ID
- `processed` (string): true, false, all
- `search` (string): Search filenames

### Bulk Delete Files
```http
POST /api/admin/content/files/bulk-delete
```

**Body:**
```json
{
  "fileIds": [1, 2, 3, 4, 5]
}
```

## ⚙️ Settings API

### Get Settings
```http
GET /api/admin/settings?group=email
```

**Response:**
```json
{
  "success": true,
  "data": {
    "site": {
      "site_name": {
        "value": "Real Estate Masterclass LMS",
        "type": "string",
        "description": "Name of the LMS platform"
      },
      "site_description": {
        "value": "Master Real Estate Investing Through Expert-Led Courses",
        "type": "string"
      }
    },
    "email": {
      "email_from_name": {
        "value": "Real Estate Masterclass",
        "type": "string"
      },
      "email_from_address": {
        "value": "noreply@masterclass-lms.com",
        "type": "string"
      }
    }
  }
}
```

### Update Settings
```http
PUT /api/admin/settings
```

**Body:**
```json
{
  "site_name": "Updated LMS Name",
  "max_file_upload_size": "150",
  "enable_registration": true,
  "payment_stripe_enabled": true
}
```

### Create Backup
```http
POST /api/admin/settings/backup
```

**Body:**
```json
{
  "name": "weekly_backup_2024_01_15",
  "type": "full", // full, tables, files
  "tables": ["users", "courses"], // required if type is 'tables'
  "compression": "gzip" // none, gzip, zip
}
```

### System Information
```http
GET /api/admin/settings/system-info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "database": {
      "totalUsers": 1250,
      "totalCourses": 45,
      "databaseSize": 125.5,
      "settingsCount": 15
    },
    "server": {
      "nodeVersion": "v18.17.0",
      "platform": "linux",
      "uptime": 86400,
      "memoryUsage": {
        "rss": 45678904,
        "heapTotal": 34567890,
        "heapUsed": 23456789
      }
    },
    "recentBackups": [
      {
        "id": 1,
        "name": "backup_full_2024-01-15",
        "type": "full",
        "size": 15728640,
        "status": "completed",
        "createdAt": "2024-01-15T02:00:00Z"
      }
    ]
  }
}
```

## 🏗️ Frontend Integration Examples

### React/Next.js Integration

#### 1. API Client Setup

```typescript
// lib/adminApi.ts
class AdminApiClient {
  private baseUrl = 'http://localhost:3001/api/admin';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Courses
  async getCourses(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/courses?${query}`);
  }

  async createCourse(data: any) {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: number, data: any) {
    return this.request(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getOverview(period = 'month') {
    return this.request(`/analytics/overview?period=${period}`);
  }

  // Users
  async getUsers(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users?${query}`);
  }

  // File Upload
  async uploadFiles(formData: FormData) {
    return this.request('/content/upload', {
      method: 'POST',
      headers: {}, // Don't set Content-Type for FormData
      body: formData,
    });
  }
}

export const adminApi = new AdminApiClient();
```

#### 2. React Hook for API Calls

```typescript
// hooks/useAdminApi.ts
import { useState, useEffect } from 'react';
import { adminApi } from '../lib/adminApi';

export function useAdminCourses(params: any = {}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const response = await adminApi.getCourses(params);
        setCourses(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [JSON.stringify(params)]);

  return { courses, loading, error, refetch: fetchCourses };
}
```

#### 3. Admin Dashboard Component

```tsx
// components/AdminDashboard.tsx
import React from 'react';
import { useAdminOverview } from '../hooks/useAdminApi';

export function AdminDashboard() {
  const { overview, loading, error } = useAdminOverview();

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error loading dashboard</div>;

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{overview.stats.users.total}</p>
          <span className={`stat-change ${overview.stats.users.change >= 0 ? 'positive' : 'negative'}`}>
            {overview.stats.users.change > 0 && '+'}{overview.stats.users.change}%
          </span>
        </div>
        
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">${overview.stats.revenue.total.toLocaleString()}</p>
          <span className={`stat-change ${overview.stats.revenue.change >= 0 ? 'positive' : 'negative'}`}>
            {overview.stats.revenue.change > 0 && '+'}{overview.stats.revenue.change}%
          </span>
        </div>
      </div>

      <div className="recent-activities">
        <h3>Recent Activities</h3>
        {overview.recentActivities.map((activity, index) => (
          <div key={index} className="activity-item">
            <span className="activity-description">{activity.description}</span>
            <span className="activity-time">{new Date(activity.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 4. Course Management Component

```tsx
// components/CourseManagement.tsx
import React, { useState } from 'react';
import { useAdminCourses } from '../hooks/useAdminApi';
import { adminApi } from '../lib/adminApi';

export function CourseManagement() {
  const [filters, setFilters] = useState({});
  const { courses, loading, error, refetch } = useAdminCourses(filters);

  const handleBulkAction = async (action: string, courseIds: number[]) => {
    try {
      await adminApi.bulkAction({ action, courseIds });
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, status: event.target.value });
  };

  return (
    <div className="course-management">
      <div className="filters">
        <select onChange={handleStatusChange}>
          <option value="">All Courses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="course-table">
        {loading ? (
          <div>Loading courses...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Instructor</th>
                <th>Price</th>
                <th>Status</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.title}</td>
                  <td>{course.instructor.name}</td>
                  <td>${course.price}</td>
                  <td>
                    <span className={`status ${course.isPublished ? 'published' : 'draft'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{course.stats.activeEnrollments}</td>
                  <td>
                    <button onClick={() => handleBulkAction('publish', [course.id])}>
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
```

## 🔐 Security Features

1. **Admin Authentication**: All endpoints protected with admin role requirement
2. **Input Validation**: Comprehensive validation on all inputs
3. **SQL Injection Prevention**: Parameterized queries throughout
4. **File Upload Security**: MIME type validation, size limits, secure storage
5. **Activity Logging**: All admin actions logged for audit trail
6. **Rate Limiting**: Built-in protection against abuse
7. **Error Handling**: Secure error responses without sensitive data

## 🚦 Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## 📊 Database Schema

The implementation includes these additional tables:
- `payment_transactions`: Payment tracking
- `refunds`: Refund management
- `coupons`: Discount codes
- `coupon_usage`: Coupon usage tracking
- `file_uploads`: File management
- `backup_logs`: Backup tracking

## 🧪 Testing

Use tools like Postman or curl to test endpoints:

```bash
# Login as admin first
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Use returned token for admin endpoints
curl -X GET http://localhost:3001/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🔄 Next Steps

1. Set up the database with provided schema files
2. Integrate the API endpoints with your React admin dashboard
3. Implement proper error handling and loading states
4. Add real-time notifications for admin actions
5. Set up file upload processing for videos/images
6. Configure backup scheduling
7. Add email service integration for bulk emails

This comprehensive backend provides all the functionality needed for a complete admin dashboard with full CRUD operations, analytics, payment management, and system administration capabilities.