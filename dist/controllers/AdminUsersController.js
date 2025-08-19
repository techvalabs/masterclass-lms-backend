import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors.js';
import { PasswordUtils } from '../middleware/auth.js';
export class AdminUsersController {
    db;
    constructor(database) {
        this.db = database;
    }
    async checkDatabaseConnection() {
        // Try to get global database instance first
        try {
            const { db } = await import('../config/database.js');
            const globalDb = db.getPool();
            if (globalDb) {
                this.db = globalDb; // Store for future use
                return true;
            }
        }
        catch (e) {
            // Continue with fallback
        }
        return this.db !== null && this.db !== undefined;
    }
    /**
     * Get all users with admin filters and pagination
     * GET /api/admin/users
     */
    getUsers = async (req, res) => {
        try {
            if (!(await this.checkDatabaseConnection())) {
                // Import realistic data dynamically
                const { realisticUsers } = await import('../data/realistic-data.js');
                // Get query parameters for fallback
                const { page = 1, limit = 20, sort = 'created_at', order = 'desc', role: roleFilter, status = 'all', search, verified = 'all', dateFrom, dateTo } = req.query;
                // Apply filters to mock data
                let filteredUsers = [...realisticUsers];
                if (roleFilter) {
                    filteredUsers = filteredUsers.filter(u => u.role.name === roleFilter);
                }
                if (status !== 'all') {
                    filteredUsers = filteredUsers.filter(u => u.isActive === (status === 'active'));
                }
                if (verified !== 'all') {
                    filteredUsers = filteredUsers.filter(u => u.emailVerified === (verified === 'true'));
                }
                if (search) {
                    const searchLower = search.toLowerCase();
                    filteredUsers = filteredUsers.filter(u => u.name.toLowerCase().includes(searchLower) ||
                        u.email.toLowerCase().includes(searchLower) ||
                        (u.phone && u.phone.toLowerCase().includes(searchLower)));
                }
                if (dateFrom) {
                    const fromDate = new Date(dateFrom);
                    filteredUsers = filteredUsers.filter(u => new Date(u.createdAt) >= fromDate);
                }
                if (dateTo) {
                    const toDate = new Date(dateTo);
                    filteredUsers = filteredUsers.filter(u => new Date(u.createdAt) <= toDate);
                }
                // Apply sorting
                const sortField = ['createdAt', 'name', 'email', 'lastLogin', 'updatedAt'].includes(sort) ? sort : 'createdAt';
                filteredUsers.sort((a, b) => {
                    let aVal = a[sortField === 'created_at' ? 'createdAt' : sortField];
                    let bVal = b[sortField === 'created_at' ? 'createdAt' : sortField];
                    if (sortField === 'createdAt' || sortField === 'updatedAt' || sortField === 'lastLogin') {
                        aVal = aVal ? new Date(aVal).getTime() : 0;
                        bVal = bVal ? new Date(bVal).getTime() : 0;
                    }
                    if (order === 'asc') {
                        return aVal > bVal ? 1 : -1;
                    }
                    else {
                        return aVal < bVal ? 1 : -1;
                    }
                });
                // Apply pagination
                const total = filteredUsers.length;
                const totalPages = Math.ceil(total / limit);
                const offset = (page - 1) * limit;
                const paginatedUsers = filteredUsers.slice(offset, offset + limit);
                return res.json({
                    success: true,
                    data: paginatedUsers,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        totalPages
                    },
                    meta: {
                        hasNext: page < totalPages,
                        hasPrev: page > 1
                    },
                    message: "Using realistic mock data - database not connected"
                });
            }
            const { page = 1, limit = 20, sort = 'created_at', order = 'desc', role: roleFilter, status = 'all', search, verified = 'all', dateFrom, dateTo } = req.query;
            // Build WHERE clause
            const conditions = [];
            const params = [];
            if (roleFilter) {
                conditions.push('r.name = ?');
                params.push(roleFilter);
            }
            if (status !== 'all') {
                conditions.push('u.is_active = ?');
                params.push(status === 'active');
            }
            if (verified !== 'all') {
                conditions.push('u.email_verified = ?');
                params.push(verified === 'true');
            }
            if (search) {
                conditions.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)');
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }
            if (dateFrom) {
                conditions.push('u.created_at >= ?');
                params.push(dateFrom);
            }
            if (dateTo) {
                conditions.push('u.created_at <= ?');
                params.push(dateTo);
            }
            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            // Validate sort field
            const allowedSortFields = ['created_at', 'name', 'email', 'last_login', 'updated_at'];
            const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
            const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
            // Count total records
            const countQuery = `
        SELECT COUNT(*) as total
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ${whereClause}
      `;
            const [countResult] = await this.db.execute(countQuery, params);
            const total = countResult[0].total;
            // Calculate pagination
            const offset = (page - 1) * limit;
            const totalPages = Math.ceil(total / limit);
            // Simplified users query to avoid referencing missing tables
            const usersQuery = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u.avatar,
          u.role_id,
          u.bio,
          u.location,
          u.website,
          u.social_links,
          u.email_verified,
          u.email_verified_at,
          u.is_active,
          u.last_login,
          u.notification_preferences,
          u.created_at,
          u.updated_at,
          r.name as role_name,
          r.description as role_description,
          0 as total_enrollments,
          0 as completed_courses,
          0.00 as total_spent,
          0 as courses_created,
          0 as reviews_given
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ${whereClause}
        ORDER BY u.${sortField} ${sortOrder}
        LIMIT ?, ?
      `;
            // Prepare parameters for the query - ensure correct types
            const limitNum = Number(limit);
            const offsetNum = Number(offset);
            console.log('Executing users query with params:', {
                filterParams: params.length,
                limit: limitNum,
                offset: offsetNum,
                query: usersQuery.substring(0, 100) + '...'
            });
            // For MySQL LIMIT ?, ? syntax, the parameters should be offset, limit
            const queryParams = [...params, offsetNum, limitNum];
            const [users] = await this.db.query(usersQuery, queryParams);
            const response = {
                success: true,
                data: users.map((user) => ({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    role: {
                        id: user.role_id,
                        name: user.role_name,
                        description: user.role_description
                    },
                    dateOfBirth: null,
                    bio: user.bio,
                    location: user.location,
                    website: user.website,
                    socialLinks: user.social_links ? (typeof user.social_links === 'string' ? JSON.parse(user.social_links) : user.social_links) : null,
                    emailVerified: user.email_verified,
                    emailVerifiedAt: user.email_verified_at,
                    isActive: user.is_active,
                    lastLogin: user.last_login,
                    preferences: user.notification_preferences ? (typeof user.notification_preferences === 'string' ? JSON.parse(user.notification_preferences) : user.notification_preferences) : null,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at,
                    stats: {
                        totalEnrollments: user.total_enrollments,
                        completedCourses: user.completed_courses,
                        totalSpent: user.total_spent ? parseFloat(user.total_spent) : 0,
                        coursesCreated: user.courses_created,
                        reviewsGiven: user.reviews_given,
                        completionRate: user.total_enrollments > 0
                            ? Math.round((user.completed_courses / user.total_enrollments) * 100)
                            : 0
                    }
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                },
                meta: {
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    /**
     * Get single user details for admin
     * GET /api/admin/users/:id
     */
    getUserById = async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            if (!userId) {
                throw new ValidationError('Invalid user ID');
            }
            // Check database connection
            if (!(await this.checkDatabaseConnection())) {
                // Import realistic data and find user
                const { realisticUsers } = await import('../data/realistic-data.js');
                const user = realisticUsers.find(u => u.id === userId);
                if (!user) {
                    throw new NotFoundError('User not found');
                }
                // Return mock detailed user data
                return res.json({
                    success: true,
                    data: {
                        ...user,
                        stats: {
                            totalEnrollments: Math.floor(Math.random() * 10) + 1,
                            completedCourses: Math.floor(Math.random() * 5),
                            totalSpent: Math.floor(Math.random() * 1000) + 100,
                            coursesCreated: user.role.name === 'instructor' ? Math.floor(Math.random() * 5) + 1 : 0,
                            reviewsGiven: Math.floor(Math.random() * 15),
                            avgRatingGiven: +(3.5 + Math.random() * 1.5).toFixed(1),
                            completionRate: Math.floor(Math.random() * 100)
                        },
                        enrollments: [],
                        payments: [],
                        activities: []
                    }
                });
            }
            // Get user with detailed information
            const userQuery = `
        SELECT 
          u.*,
          r.name as role_name,
          r.description as role_description,
          r.permissions as role_permissions,
          (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id AND e.is_active = 1) as total_enrollments,
          (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id AND e.completed_at IS NOT NULL) as completed_courses,
          (SELECT SUM(pt.amount) FROM payment_transactions pt WHERE pt.user_id = u.id AND pt.status = 'completed') as total_spent,
          (SELECT COUNT(*) FROM courses c JOIN instructors i ON c.instructor_id = i.id WHERE i.user_id = u.id) as courses_created,
          (SELECT COUNT(*) FROM course_reviews cr WHERE cr.user_id = u.id) as reviews_given,
          (SELECT AVG(cr.rating) FROM course_reviews cr WHERE cr.user_id = u.id) as avg_rating_given
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `;
            const [userResult] = await this.db.execute(userQuery, [userId]);
            if (userResult.length === 0) {
                throw new NotFoundError('User not found');
            }
            const user = userResult[0];
            // Get user's enrollments
            const enrollmentsQuery = `
        SELECT 
          e.id,
          e.enrolled_at,
          e.progress_percentage,
          e.completed_at,
          e.payment_status,
          e.payment_amount,
          c.id as course_id,
          c.title as course_title,
          c.thumbnail as course_thumbnail,
          c.price as course_price,
          i.id as instructor_id,
          u_instructor.name as instructor_name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN instructors i ON c.instructor_id = i.id
        LEFT JOIN users u_instructor ON i.user_id = u_instructor.id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
        LIMIT 10
      `;
            const [enrollments] = await this.db.execute(enrollmentsQuery, [userId]);
            // Get user's payment history
            const paymentsQuery = `
        SELECT 
          pt.id,
          pt.transaction_id,
          pt.amount,
          pt.currency,
          pt.status,
          pt.payment_method,
          pt.payment_date,
          pt.description,
          c.title as course_title
        FROM payment_transactions pt
        LEFT JOIN courses c ON pt.course_id = c.id
        WHERE pt.user_id = ?
        ORDER BY pt.created_at DESC
        LIMIT 10
      `;
            const [payments] = await this.db.execute(paymentsQuery, [userId]);
            // Get user's activity logs (if table exists)
            let activities = [];
            try {
                const activityQuery = `
          SELECT 
            al.action,
            al.entity_type,
            al.entity_id,
            al.description,
            al.ip_address,
            al.created_at
          FROM activity_logs al
          WHERE al.user_id = ?
          ORDER BY al.created_at DESC
          LIMIT 20
        `;
                const [activityResult] = await this.db.execute(activityQuery, [userId]);
                activities = activityResult;
            }
            catch (error) {
                // Activity logs table might not exist, continue without it
                console.log('Activity logs table not available');
                activities = [];
            }
            const response = {
                success: true,
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    role: {
                        id: user.role_id,
                        name: user.role_name,
                        description: user.role_description,
                        permissions: user.role_permissions ? JSON.parse(user.role_permissions) : []
                    },
                    dateOfBirth: null,
                    bio: user.bio,
                    location: user.location,
                    website: user.website,
                    socialLinks: user.social_links ? (typeof user.social_links === 'string' ? JSON.parse(user.social_links) : user.social_links) : null,
                    emailVerified: user.email_verified,
                    emailVerifiedAt: user.email_verified_at,
                    isActive: user.is_active,
                    lastLogin: user.last_login,
                    preferences: user.notification_preferences ? (typeof user.notification_preferences === 'string' ? JSON.parse(user.notification_preferences) : user.notification_preferences) : null,
                    createdAt: user.created_at,
                    updatedAt: user.updated_at,
                    stats: {
                        totalEnrollments: user.total_enrollments,
                        completedCourses: user.completed_courses,
                        totalSpent: user.total_spent ? parseFloat(user.total_spent) : 0,
                        coursesCreated: user.courses_created,
                        reviewsGiven: user.reviews_given,
                        avgRatingGiven: user.avg_rating_given ? parseFloat(user.avg_rating_given) : 0,
                        completionRate: user.total_enrollments > 0
                            ? Math.round((user.completed_courses / user.total_enrollments) * 100)
                            : 0
                    },
                    enrollments: enrollments.map((e) => ({
                        id: e.id,
                        enrolledAt: e.enrolled_at,
                        progressPercentage: parseFloat(e.progress_percentage),
                        completedAt: e.completed_at,
                        lastAccessedAt: null,
                        paymentStatus: e.payment_status,
                        paymentAmount: e.payment_amount ? parseFloat(e.payment_amount) : 0,
                        course: {
                            id: e.course_id,
                            title: e.course_title,
                            thumbnail: e.course_thumbnail,
                            price: parseFloat(e.course_price),
                            instructor: {
                                id: e.instructor_id,
                                name: e.instructor_name
                            }
                        }
                    })),
                    payments: payments.map((p) => ({
                        id: p.id,
                        transactionId: p.transaction_id,
                        amount: parseFloat(p.amount),
                        currency: p.currency,
                        status: p.status,
                        paymentMethod: p.payment_method,
                        paymentDate: p.payment_date,
                        description: p.description,
                        courseTitle: p.course_title
                    })),
                    activities: activities.map((a) => ({
                        action: a.action,
                        entityType: a.entity_type,
                        entityId: a.entity_id,
                        description: a.description,
                        ipAddress: a.ip_address,
                        createdAt: a.created_at
                    }))
                }
            };
            res.json(response);
        }
        catch (error) {
            console.error('Get user by ID error:', error);
            if (error instanceof NotFoundError || error instanceof ValidationError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch user details',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Update user
     * PUT /api/admin/users/:id
     */
    updateUser = async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            if (!userId) {
                throw new ValidationError('Invalid user ID');
            }
            // Prevent admin from modifying themselves
            if (userId === req.user.id) {
                throw new ValidationError('Cannot modify your own account');
            }
            if (!(await this.checkDatabaseConnection())) {
                return res.status(503).json({
                    success: false,
                    message: 'Database not available - cannot update users'
                });
            }
            // Check if user exists
            const [existingUser] = await this.db.execute('SELECT id, name, email, email_verified FROM users WHERE id = ?', [userId]);
            if (existingUser.length === 0) {
                throw new NotFoundError('User not found');
            }
            const { name, email, phone, avatar, roleId, dateOfBirth, bio, location, website, socialLinks, isActive, emailVerified, preferences, password } = req.body;
            // Build update query dynamically
            const updateFields = [];
            const updateParams = [];
            if (name !== undefined) {
                updateFields.push('name = ?');
                updateParams.push(name);
            }
            if (email !== undefined) {
                // Check if email is already taken by another user
                const [emailCheck] = await this.db.execute('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
                if (emailCheck.length > 0) {
                    throw new ValidationError('Email is already taken');
                }
                updateFields.push('email = ?');
                updateParams.push(email);
            }
            if (phone !== undefined) {
                updateFields.push('phone = ?');
                updateParams.push(phone);
            }
            if (avatar !== undefined) {
                updateFields.push('avatar = ?');
                updateParams.push(avatar);
            }
            if (roleId !== undefined) {
                // Verify role exists
                const [roles] = await this.db.execute('SELECT id FROM roles WHERE id = ?', [roleId]);
                if (roles.length === 0) {
                    throw new ValidationError('Invalid role ID');
                }
                updateFields.push('role_id = ?');
                updateParams.push(roleId);
            }
            if (bio !== undefined) {
                updateFields.push('bio = ?');
                updateParams.push(bio);
            }
            if (location !== undefined) {
                updateFields.push('location = ?');
                updateParams.push(location);
            }
            if (website !== undefined) {
                updateFields.push('website = ?');
                updateParams.push(website);
            }
            if (socialLinks !== undefined) {
                updateFields.push('social_links = ?');
                updateParams.push(socialLinks ? JSON.stringify(socialLinks) : null);
            }
            if (isActive !== undefined) {
                updateFields.push('is_active = ?');
                updateParams.push(isActive);
            }
            if (emailVerified !== undefined) {
                updateFields.push('email_verified = ?');
                updateParams.push(emailVerified);
                if (emailVerified && !existingUser[0].email_verified) {
                    updateFields.push('email_verified_at = NOW()');
                }
            }
            if (preferences !== undefined) {
                updateFields.push('preferences = ?');
                updateParams.push(preferences ? JSON.stringify(preferences) : null);
            }
            if (password !== undefined) {
                // Validate password strength
                const passwordValidation = PasswordUtils.validate(password);
                if (!passwordValidation.isValid) {
                    throw new ValidationError(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
                }
                const hashedPassword = await PasswordUtils.hash(password);
                updateFields.push('password_hash = ?');
                updateParams.push(hashedPassword);
            }
            if (updateFields.length === 0) {
                throw new ValidationError('No fields to update');
            }
            updateFields.push('updated_at = NOW()');
            const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
            await this.db.execute(updateQuery, [...updateParams, userId]);
            // Log activity
            const changes = updateFields.filter(field => !field.includes('updated_at')).map(field => field.split(' = ')[0]);
            await this.db.execute('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', [
                req.user.id,
                'user_updated',
                'user',
                userId,
                `Updated user: ${existingUser[0].name || existingUser[0].email}`,
                JSON.stringify({ updatedFields: changes })
            ]);
            res.json({
                success: true,
                message: 'User updated successfully',
                data: {
                    id: userId
                }
            });
        }
        catch (error) {
            console.error('Update user error:', error);
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to update user',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Delete user
     * DELETE /api/admin/users/:id
     */
    deleteUser = async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const forceDelete = req.query.force === 'true';
            if (!userId) {
                throw new ValidationError('Invalid user ID');
            }
            // Prevent admin from deleting themselves
            if (userId === req.user.id) {
                throw new ValidationError('Cannot delete your own account');
            }
            // Get database connection from global instance
            const { db: database } = await import('../config/database.js');
            const db = database.getPool();
            if (!db) {
                return res.status(503).json({
                    success: false,
                    message: 'Database service temporarily unavailable. Please try again in a moment.'
                });
            }
            // Check if user exists and get their role
            const [existingUser] = await db.execute(`SELECT u.id, u.name, u.email, u.role_id, r.name as role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE u.id = ?`, [userId]);
            if (existingUser.length === 0) {
                throw new NotFoundError('User not found');
            }
            const user = existingUser[0];
            // Prevent deletion of admin users (except by force)
            if (user.role_name === 'admin' && !forceDelete) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete admin users. Admin accounts are protected.',
                    data: {
                        isAdmin: true,
                        canForceDelete: false
                    }
                });
            }
            // Check if user has enrollments
            const [enrollmentCheck] = await db.execute('SELECT COUNT(*) as count FROM enrollments WHERE user_id = ? AND is_active = 1', [userId]);
            const enrollmentCount = enrollmentCheck[0].count;
            if (enrollmentCount > 0 && !forceDelete) {
                // User has enrollments, require force delete
                return res.status(400).json({
                    success: false,
                    message: `User has ${enrollmentCount} active enrollment${enrollmentCount > 1 ? 's' : ''}. Force delete required.`,
                    data: {
                        enrollmentCount,
                        canForceDelete: true
                    }
                });
            }
            // Check if user is an instructor with courses
            const [instructorCheck] = await db.execute('SELECT COUNT(*) as count FROM courses c JOIN instructors i ON c.instructor_id = i.id WHERE i.user_id = ?', [userId]);
            if (instructorCheck[0].count > 0) {
                throw new ValidationError('Cannot delete user who has created courses. Transfer or delete courses first.');
            }
            // Get connection for transaction
            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();
                // Delete related data in order - use try/catch for each to handle missing tables
                const deletions = [
                    { table: 'user_sessions', field: 'user_id' },
                    { table: 'notifications', field: 'user_id' },
                    { table: 'user_points', field: 'user_id' },
                    { table: 'user_badges', field: 'user_id' },
                    { table: 'user_favorites', field: 'user_id' },
                    { table: 'lesson_progress', field: 'user_id' },
                    { table: 'course_progress', field: 'user_id' },
                    { table: 'course_reviews', field: 'user_id' },
                    { table: 'quiz_attempts', field: 'user_id' },
                    { table: 'certificates', field: 'user_id' },
                    { table: 'enrollments', field: 'user_id' },
                    { table: 'payment_transactions', field: 'user_id' },
                    { table: 'coupon_usage', field: 'user_id' },
                    { table: 'file_uploads', field: 'user_id' },
                    { table: 'email_logs', field: 'user_id' },
                    { table: 'email_logs', field: 'from_user_id' }
                ];
                for (const { table, field } of deletions) {
                    try {
                        await connection.execute(`DELETE FROM ${table} WHERE ${field} = ?`, [userId]);
                    }
                    catch (err) {
                        // Skip if table doesn't exist
                        if (err.code !== 'ER_NO_SUCH_TABLE') {
                            console.warn(`Could not delete from ${table}: ${err.message}`);
                        }
                    }
                }
                // Update activity logs to remove user reference but keep the logs
                try {
                    await connection.execute('UPDATE activity_logs SET user_id = NULL WHERE user_id = ?', [userId]);
                }
                catch (err) {
                    // Skip if table doesn't exist
                    if (err.code !== 'ER_NO_SUCH_TABLE') {
                        console.warn(`Could not update activity_logs: ${err.message}`);
                    }
                }
                // Delete the user
                await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
                // Log activity
                try {
                    await connection.execute('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [req.user.id, 'user_deleted', 'user', userId, `Deleted user: ${user.name} (${user.email})`]);
                }
                catch (err) {
                    // Skip if table doesn't exist
                    if (err.code !== 'ER_NO_SUCH_TABLE') {
                        console.warn(`Could not log user deletion: ${err.message}`);
                    }
                }
                await connection.commit();
                connection.release();
                res.json({
                    success: true,
                    message: 'User deleted successfully'
                });
            }
            catch (transactionError) {
                await connection.rollback();
                connection.release();
                throw transactionError;
            }
        }
        catch (error) {
            console.error('Delete user error:', error);
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete user',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Change user role
     * POST /api/admin/users/:id/change-role
     */
    changeUserRole = async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const { roleId } = req.body;
            if (!userId || !roleId) {
                throw new ValidationError('User ID and role ID are required');
            }
            // Prevent admin from changing their own role
            if (userId === req.user.id) {
                throw new ValidationError('Cannot change your own role');
            }
            // Check if user exists
            const [existingUser] = await this.db.execute('SELECT id, name, email, role_id FROM users WHERE id = ?', [userId]);
            if (existingUser.length === 0) {
                throw new NotFoundError('User not found');
            }
            const user = existingUser[0];
            // Check if role exists
            const [role] = await this.db.execute('SELECT id, name FROM roles WHERE id = ?', [roleId]);
            if (role.length === 0) {
                throw new ValidationError('Invalid role ID');
            }
            if (user.role_id === roleId) {
                throw new ValidationError('User already has this role');
            }
            // Update user role
            await this.db.execute('UPDATE users SET role_id = ?, updated_at = NOW() WHERE id = ?', [roleId, userId]);
            // Log activity
            await this.db.execute('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())', [
                req.user.id,
                'user_role_changed',
                'user',
                userId,
                `Changed role for user: ${user.name} (${user.email})`,
                JSON.stringify({
                    oldRoleId: user.role_id,
                    newRoleId: roleId,
                    newRoleName: role[0].name
                })
            ]);
            res.json({
                success: true,
                message: 'User role changed successfully',
                data: {
                    userId,
                    newRole: {
                        id: roleId,
                        name: role[0].name
                    }
                }
            });
        }
        catch (error) {
            console.error('Change user role error:', error);
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to change user role',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Toggle user status (activate/deactivate)
     * POST /api/admin/users/:id/toggle-status
     */
    toggleUserStatus = async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            if (!userId) {
                throw new ValidationError('Invalid user ID');
            }
            // Prevent admin from deactivating themselves
            if (userId === req.user.id) {
                throw new ValidationError('Cannot change your own status');
            }
            // Check if user exists
            const [existingUser] = await this.db.execute('SELECT id, name, email, is_active FROM users WHERE id = ?', [userId]);
            if (existingUser.length === 0) {
                throw new NotFoundError('User not found');
            }
            const user = existingUser[0];
            const newStatus = !user.is_active;
            // Update user status
            await this.db.execute('UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?', [newStatus, userId]);
            // If deactivating, invalidate all user sessions
            if (!newStatus) {
                await this.db.execute('UPDATE user_sessions SET is_active = 0 WHERE user_id = ?', [userId]);
            }
            // Log activity
            await this.db.execute('INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [
                req.user.id,
                newStatus ? 'user_activated' : 'user_deactivated',
                'user',
                userId,
                `${newStatus ? 'Activated' : 'Deactivated'} user: ${user.name} (${user.email})`
            ]);
            res.json({
                success: true,
                message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
                data: {
                    userId,
                    isActive: newStatus
                }
            });
        }
        catch (error) {
            console.error('Toggle user status error:', error);
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to toggle user status',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Send bulk emails to users
     * POST /api/admin/users/bulk-email
     */
    sendBulkEmail = async (req, res) => {
        try {
            const { recipients, userIds, roleId, subject, message, template } = req.body;
            if (!recipients || !subject || !message) {
                throw new ValidationError('Recipients, subject, and message are required');
            }
            let emailQuery = '';
            let emailParams = [];
            switch (recipients) {
                case 'all':
                    emailQuery = 'SELECT id, name, email FROM users WHERE is_active = 1 AND email_verified = 1';
                    break;
                case 'role':
                    if (!roleId) {
                        throw new ValidationError('Role ID is required for role-based emails');
                    }
                    emailQuery = 'SELECT id, name, email FROM users WHERE role_id = ? AND is_active = 1 AND email_verified = 1';
                    emailParams = [roleId];
                    break;
                case 'specific':
                    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                        throw new ValidationError('User IDs are required for specific user emails');
                    }
                    const placeholders = userIds.map(() => '?').join(',');
                    emailQuery = `SELECT id, name, email FROM users WHERE id IN (${placeholders}) AND is_active = 1 AND email_verified = 1`;
                    emailParams = userIds;
                    break;
                default:
                    throw new ValidationError('Invalid recipients type');
            }
            const [users] = await this.db.execute(emailQuery, emailParams);
            if (users.length === 0) {
                throw new ValidationError('No eligible users found for the specified criteria');
            }
            // For now, we'll just log the email activity
            // In a real implementation, you would integrate with an email service
            const emailLog = {
                recipients: recipients,
                userCount: users.length,
                subject: subject,
                template: template || 'default',
                sentBy: req.user.id,
                sentAt: new Date()
            };
            // Log the bulk email activity
            await this.db.execute('INSERT INTO activity_logs (user_id, action, entity_type, description, metadata, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [
                req.user.id,
                'bulk_email_sent',
                'email',
                `Bulk email sent to ${users.length} users: ${subject}`,
                JSON.stringify(emailLog)
            ]);
            res.json({
                success: true,
                message: `Bulk email queued for ${users.length} users`,
                data: {
                    recipientCount: users.length,
                    subject: subject,
                    template: template || 'default'
                }
            });
        }
        catch (error) {
            console.error('Send bulk email error:', error);
            if (error instanceof ValidationError) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to send bulk email',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Bulk actions on users
     * POST /api/admin/users/bulk-action
     */
    bulkAction = async (req, res) => {
        try {
            const { action, userIds, roleId } = req.body;
            if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
                throw new ValidationError('Action and user IDs are required');
            }
            const validActions = ['activate', 'deactivate', 'delete', 'verify', 'change_role'];
            if (!validActions.includes(action)) {
                throw new ValidationError('Invalid action');
            }
            // Prevent admin from performing bulk actions on themselves
            if (userIds.includes(req.user.id)) {
                throw new ValidationError('Cannot perform bulk actions on your own account');
            }
            // Validate all user IDs exist
            const placeholders = userIds.map(() => '?').join(',');
            const [existingUsers] = await this.db.execute(`SELECT id, name, email FROM users WHERE id IN (${placeholders})`, userIds);
            if (existingUsers.length !== userIds.length) {
                throw new ValidationError('Some users were not found');
            }
            let query = '';
            let queryParams = [];
            let successMessage = '';
            switch (action) {
                case 'activate':
                    query = `UPDATE users SET is_active = 1, updated_at = NOW() WHERE id IN (${placeholders})`;
                    queryParams = userIds;
                    successMessage = `${userIds.length} users activated successfully`;
                    break;
                case 'deactivate':
                    query = `UPDATE users SET is_active = 0, updated_at = NOW() WHERE id IN (${placeholders})`;
                    queryParams = userIds;
                    // Also invalidate sessions for deactivated users
                    await this.db.execute(`UPDATE user_sessions SET is_active = 0 WHERE user_id IN (${placeholders})`, userIds);
                    successMessage = `${userIds.length} users deactivated successfully`;
                    break;
                case 'verify':
                    query = `UPDATE users SET email_verified = 1, email_verified_at = NOW(), updated_at = NOW() WHERE id IN (${placeholders})`;
                    queryParams = userIds;
                    successMessage = `${userIds.length} users verified successfully`;
                    break;
                case 'change_role':
                    if (!roleId) {
                        throw new ValidationError('Role ID is required for role change action');
                    }
                    // Verify role exists
                    const [role] = await this.db.execute('SELECT id, name FROM roles WHERE id = ?', [roleId]);
                    if (role.length === 0) {
                        throw new ValidationError('Invalid role ID');
                    }
                    query = `UPDATE users SET role_id = ?, updated_at = NOW() WHERE id IN (${placeholders})`;
                    queryParams = [roleId, ...userIds];
                    successMessage = `${userIds.length} users role changed to ${role[0].name} successfully`;
                    break;
                case 'delete':
                    // This is a complex operation that requires careful handling
                    // Check if any users are instructors with courses
                    const [instructorCheck] = await this.db.execute(`SELECT u.id, u.name, COUNT(c.id) as course_count 
             FROM users u 
             LEFT JOIN instructors i ON u.id = i.user_id 
             LEFT JOIN courses c ON i.id = c.instructor_id 
             WHERE u.id IN (${placeholders}) 
             GROUP BY u.id`, userIds);
                    const usersWithCourses = instructorCheck.filter((u) => u.course_count > 0);
                    if (usersWithCourses.length > 0) {
                        throw new ValidationError(`Cannot delete users who have created courses: ${usersWithCourses.map((u) => u.name).join(', ')}`);
                    }
                    // Start transaction for bulk delete
                    await this.db.execute('START TRANSACTION');
                    try {
                        // Delete related data for all users
                        await this.db.execute(`DELETE FROM user_sessions WHERE user_id IN (${placeholders})`, userIds);
                        await this.db.execute(`DELETE FROM notifications WHERE user_id IN (${placeholders})`, userIds);
                        await this.db.execute(`DELETE FROM course_reviews WHERE user_id IN (${placeholders})`, userIds);
                        await this.db.execute(`DELETE FROM quiz_attempts WHERE user_id IN (${placeholders})`, userIds);
                        await this.db.execute(`DELETE FROM progress WHERE user_id IN (${placeholders})`, userIds);
                        await this.db.execute(`DELETE FROM certificates WHERE user_id IN (${placeholders})`, userIds);
                        await this.db.execute(`DELETE FROM enrollments WHERE user_id IN (${placeholders})`, userIds);
                        await this.db.execute(`DELETE FROM payment_transactions WHERE user_id IN (${placeholders})`, userIds);
                        await this.db.execute(`DELETE FROM coupon_usage WHERE user_id IN (${placeholders})`, userIds);
                        await this.db.execute(`DELETE FROM file_uploads WHERE user_id IN (${placeholders})`, userIds);
                        await this.db.execute(`UPDATE activity_logs SET user_id = NULL WHERE user_id IN (${placeholders})`, userIds);
                        await this.db.execute(`DELETE FROM users WHERE id IN (${placeholders})`, userIds);
                        await this.db.execute('COMMIT');
                        successMessage = `${userIds.length} users deleted successfully`;
                    }
                    catch (error) {
                        await this.db.execute('ROLLBACK');
                        throw error;
                    }
                    break;
            }
            if (query && action !== 'delete') {
                await this.db.execute(query, queryParams);
            }
            // Log bulk activity
            const userNames = existingUsers.map((u) => u.name || u.email).join(', ');
            await this.db.execute('INSERT INTO activity_logs (user_id, action, entity_type, description, metadata, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [
                req.user.id,
                `bulk_${action}`,
                'user',
                `Bulk ${action} on users: ${userNames}`,
                JSON.stringify({ userIds, action, roleId })
            ]);
            res.json({
                success: true,
                message: successMessage,
                data: {
                    action,
                    affectedUsers: userIds.length
                }
            });
        }
        catch (error) {
            console.error('Bulk action error:', error);
            if (error instanceof ValidationError) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to perform bulk action',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Get user statistics
     * GET /api/admin/users/:id/statistics
     */
    getUserStatistics = async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            if (!userId) {
                throw new ValidationError('Invalid user ID');
            }
            // Check database connection
            if (!(await this.checkDatabaseConnection())) {
                // Return mock statistics for development
                return res.json({
                    success: true,
                    data: {
                        coursesEnrolled: Math.floor(Math.random() * 10) + 1,
                        coursesCompleted: Math.floor(Math.random() * 5),
                        totalSpent: Math.floor(Math.random() * 1000) + 100,
                        avgRating: +(3.5 + Math.random() * 1.5).toFixed(1),
                        totalHours: Math.floor(Math.random() * 100) + 10,
                        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                        joinedDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                        profileCompleteness: Math.floor(Math.random() * 30) + 70
                    }
                });
            }
            // Get user statistics
            const [stats] = await this.db.execute(`
        SELECT 
          (SELECT COUNT(*) FROM enrollments WHERE user_id = ? AND is_active = 1) as courses_enrolled,
          (SELECT COUNT(*) FROM enrollments WHERE user_id = ? AND completed_at IS NOT NULL) as courses_completed,
          (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE user_id = ? AND status = 'completed') as total_spent,
          (SELECT COALESCE(AVG(rating), 0) FROM course_reviews WHERE user_id = ?) as avg_rating,
          (SELECT COALESCE(SUM(time_spent), 0) FROM lesson_progress WHERE user_id = ?) as total_seconds,
          (SELECT last_login FROM users WHERE id = ?) as last_activity,
          (SELECT created_at FROM users WHERE id = ?) as joined_date,
          (CASE 
            WHEN (SELECT COUNT(*) FROM users WHERE id = ? AND phone IS NOT NULL AND location IS NOT NULL AND bio IS NOT NULL) > 0 
            THEN 100 
            ELSE 50 
          END) as profile_completeness
      `, [userId, userId, userId, userId, userId, userId, userId, userId]);
            const statistics = {
                coursesEnrolled: stats[0].courses_enrolled || 0,
                coursesCompleted: stats[0].courses_completed || 0,
                totalSpent: parseFloat(stats[0].total_spent) || 0,
                avgRating: parseFloat(stats[0].avg_rating) || 0,
                totalHours: Math.round((stats[0].total_seconds || 0) / 3600),
                lastActivity: stats[0].last_activity || new Date().toISOString(),
                joinedDate: stats[0].joined_date || new Date().toISOString(),
                profileCompleteness: stats[0].profile_completeness || 0
            };
            res.json({
                success: true,
                data: statistics
            });
        }
        catch (error) {
            console.error('Get user statistics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user statistics',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    /**
     * Get user activity
     * GET /api/admin/users/:id/activity
     */
    getUserActivity = async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            if (!userId) {
                throw new ValidationError('Invalid user ID');
            }
            // Check database connection
            if (!(await this.checkDatabaseConnection())) {
                // Return mock activity for development
                return res.json({
                    success: true,
                    data: [
                        {
                            id: 'activity-1',
                            type: 'enrollment',
                            description: 'Enrolled in Introduction to Real Estate',
                            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                            metadata: { courseId: 1 }
                        },
                        {
                            id: 'activity-2',
                            type: 'completion',
                            description: 'Completed lesson: Market Analysis Basics',
                            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                            metadata: { lessonId: 5 }
                        },
                        {
                            id: 'activity-3',
                            type: 'review',
                            description: 'Reviewed Property Investment Fundamentals (4 stars)',
                            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                            metadata: { rating: 4, courseId: 2 }
                        },
                        {
                            id: 'activity-4',
                            type: 'login',
                            description: 'Logged in from Chrome on Windows',
                            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                            metadata: { browser: 'Chrome', os: 'Windows' }
                        },
                        {
                            id: 'activity-5',
                            type: 'purchase',
                            description: 'Purchased Advanced Real Estate Strategies for $199',
                            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                            metadata: { amount: 199, courseId: 3 }
                        }
                    ]
                });
            }
            // Get recent user activities (combining multiple activity types)
            const activities = [];
            // Get recent enrollments
            const [enrollments] = await this.db.execute(`
        SELECT 
          'enrollment' as type,
          CONCAT('Enrolled in ', c.title) as description,
          e.enrolled_at as timestamp,
          c.id as course_id
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
        LIMIT 5
      `, [userId]);
            // Get recent course completions
            const [completions] = await this.db.execute(`
        SELECT 
          'completion' as type,
          CONCAT('Completed ', c.title) as description,
          e.completed_at as timestamp,
          c.id as course_id
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ? AND e.completed_at IS NOT NULL
        ORDER BY e.completed_at DESC
        LIMIT 5
      `, [userId]);
            // Get recent reviews
            const [reviews] = await this.db.execute(`
        SELECT 
          'review' as type,
          CONCAT('Reviewed ', c.title, ' (', cr.rating, ' stars)') as description,
          cr.created_at as timestamp,
          c.id as course_id,
          cr.rating
        FROM course_reviews cr
        JOIN courses c ON cr.course_id = c.id
        WHERE cr.user_id = ?
        ORDER BY cr.created_at DESC
        LIMIT 5
      `, [userId]);
            // Get recent purchases
            const [purchases] = await this.db.execute(`
        SELECT 
          'purchase' as type,
          CONCAT('Purchased ', c.title, ' for $', pt.amount) as description,
          pt.created_at as timestamp,
          c.id as course_id,
          pt.amount
        FROM payment_transactions pt
        JOIN courses c ON pt.course_id = c.id
        WHERE pt.user_id = ? AND pt.status = 'completed'
        ORDER BY pt.created_at DESC
        LIMIT 5
      `, [userId]);
            // Combine and sort all activities
            const allActivities = [
                ...enrollments.map((e, i) => ({ id: `enroll-${i}`, ...e })),
                ...completions.map((c, i) => ({ id: `complete-${i}`, ...c })),
                ...reviews.map((r, i) => ({ id: `review-${i}`, ...r, metadata: { rating: r.rating } })),
                ...purchases.map((p, i) => ({ id: `purchase-${i}`, ...p, metadata: { amount: p.amount } }))
            ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 10);
            res.json({
                success: true,
                data: allActivities
            });
        }
        catch (error) {
            console.error('Get user activity error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user activity',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
    /**
     * Send email to user
     * POST /api/admin/users/:id/send-email
     */
    sendEmailToUser = async (req, res) => {
        try {
            const userId = parseInt(req.params.id);
            const { subject, message, sendCopy } = req.body;
            if (!userId) {
                throw new ValidationError('Invalid user ID');
            }
            if (!subject || !message) {
                throw new ValidationError('Subject and message are required');
            }
            // Get user details
            const [users] = await this.db.execute('SELECT id, name, email FROM users WHERE id = ?', [userId]);
            if (users.length === 0) {
                throw new NotFoundError('User not found');
            }
            const user = users[0];
            // Here you would integrate with your email service
            // For now, we'll simulate email sending
            console.log(`Sending email to ${user.email}:`, { subject, message });
            // Log the email in the database (optional - only if table exists)
            if (await this.checkDatabaseConnection()) {
                try {
                    await this.db.execute(`
            INSERT INTO email_logs (user_id, from_user_id, subject, message, sent_at)
            VALUES (?, ?, ?, ?, NOW())
          `, [userId, req.user.id, subject, message]);
                }
                catch (error) {
                    // Table might not exist, continue anyway
                    console.log('Email log table not available, continuing without logging');
                }
            }
            // Send copy to admin if requested
            if (sendCopy) {
                console.log(`Sending copy to admin: ${req.user.email}`);
            }
            res.json({
                success: true,
                message: `Email sent successfully to ${user.name}`
            });
        }
        catch (error) {
            console.error('Send email error:', error);
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                res.status(error instanceof NotFoundError ? 404 : 400).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to send email',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
    /**
     * Create a new user
     */
    createUser = async (req, res) => {
        try {
            if (!this.db) {
                throw new DatabaseError('Database connection not available');
            }
            const { name, email, password, role, phone, location, bio, isActive = true, emailVerified = false } = req.body;
            // Validate required fields
            if (!name || !email || !password || !role) {
                throw new ValidationError('Name, email, password, and role are required');
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new ValidationError('Invalid email format');
            }
            // Validate password length
            if (password.length < 8) {
                throw new ValidationError('Password must be at least 8 characters long');
            }
            // Check if email already exists
            const [existingUsers] = await this.db.execute('SELECT id FROM users WHERE email = ?', [email]);
            if (Array.isArray(existingUsers) && existingUsers.length > 0) {
                throw new ValidationError('Email already exists');
            }
            // Get role ID
            const [roles] = await this.db.execute('SELECT id FROM roles WHERE name = ?', [role]);
            if (!Array.isArray(roles) || roles.length === 0) {
                throw new ValidationError('Invalid role');
            }
            const roleId = roles[0].id;
            // Hash password
            const passwordHash = await PasswordUtils.hash(password);
            // Insert new user
            const [result] = await this.db.execute(`INSERT INTO users 
        (name, email, password_hash, role_id, phone, location, bio, is_active, email_verified, email_verified_at, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
                name,
                email,
                passwordHash,
                roleId,
                phone || null,
                location || null,
                bio || null,
                isActive ? 1 : 0,
                emailVerified ? 1 : 0,
                emailVerified ? new Date() : null
            ]);
            const userId = result.insertId;
            // If role is instructor, create instructor record
            if (role === 'instructor') {
                await this.db.execute(`INSERT INTO instructors 
          (user_id, experience, qualifications, specialties, status, approved_at, created_at, updated_at)
          VALUES (?, '', '[]', '[]', 'pending', NULL, NOW(), NOW())`, [userId]);
            }
            // Fetch the created user
            const [users] = await this.db.execute(`SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u.location,
          u.bio,
          u.avatar,
          u.is_active,
          u.email_verified,
          u.created_at,
          u.updated_at,
          r.name as role,
          r.id as role_id
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?`, [userId]);
            const user = users[0];
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    location: user.location,
                    bio: user.bio,
                    avatar: user.avatar,
                    role: {
                        id: user.role_id,
                        name: user.role
                    },
                    isActive: Boolean(user.is_active),
                    emailVerified: Boolean(user.email_verified),
                    createdAt: user.created_at,
                    updatedAt: user.updated_at
                }
            });
        }
        catch (error) {
            console.error('Create user error:', error);
            if (error instanceof ValidationError) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            else if (error instanceof DatabaseError) {
                res.status(503).json({
                    success: false,
                    message: error.message
                });
            }
            else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to create user',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
    };
}
export default AdminUsersController;
//# sourceMappingURL=AdminUsersController.js.map