import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database.js';
import { 
  AuthenticationError, 
  AuthorizationError, 
  ValidationError,
  ErrorResponses,
  asyncHandler 
} from '../utils/errors.js';
import { logAuth, logSecurity } from '../utils/logger.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        role: string;
        roleId: number;
        permissions: string[];
        isVerified: boolean;
        isActive: boolean;
      };
    }
  }
}

interface JwtPayload {
  userId: number;
  email: string;
  type: 'access' | 'refresh';
  sessionId?: string;
}

interface UserSession {
  id: number;
  user_id: number;
  refresh_token: string;
  access_token_id: string;
  is_active: boolean;
  expires_at: Date;
  ip_address: string | null;
  user_agent: string | null;
}

interface User {
  id: number;
  email: string;
  name: string;
  password_hash: string;
  role_id: number;
  email_verified: boolean;
  is_active: boolean;
  last_login: Date | null;
}

interface Role {
  id: number;
  name: string;
  permissions: string[];
}

/**
 * JWT utility functions
 */
export const JwtUtils = {
  /**
   * Generate access token
   */
  generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    return jwt.sign(
      { ...payload, type: 'access' },
      secret,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        issuer: 'masterclass-lms',
        audience: 'masterclass-lms-users'
      }
    );
  },

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }

    return jwt.sign(
      { ...payload, type: 'refresh' },
      secret,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'masterclass-lms',
        audience: 'masterclass-lms-users'
      }
    );
  },

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JwtPayload {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    try {
      const payload = jwt.verify(token, secret, {
        issuer: 'masterclass-lms',
        audience: 'masterclass-lms-users'
      }) as JwtPayload;

      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ErrorResponses.tokenExpired();
      }
      throw ErrorResponses.invalidToken();
    }
  },

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is not set');
    }

    try {
      const payload = jwt.verify(token, secret, {
        issuer: 'masterclass-lms',
        audience: 'masterclass-lms-users'
      }) as JwtPayload;

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw ErrorResponses.tokenExpired();
      }
      throw ErrorResponses.invalidToken();
    }
  },

  /**
   * Generate both access and refresh tokens
   */
  generateTokens(payload: { userId: number; email: string }) {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);
    return { accessToken, refreshToken };
  },

  /**
   * Generate a secure random token
   */
  generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
};

/**
 * Password utility functions
 */
export const PasswordUtils = {
  /**
   * Hash password
   */
  async hash(password: string): Promise<string> {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return bcrypt.hash(password, rounds);
  },

  /**
   * Compare password with hash
   */
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  /**
   * Validate password strength
   */
  validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const minLength = parseInt(process.env.PASSWORD_MIN_LENGTH || '8');

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

/**
 * Session management functions
 */
export const SessionUtils = {
  /**
   * Create user session
   */
  async createSession(
    userId: number,
    refreshToken: string,
    accessTokenId: string,
    req: Request
  ): Promise<number> {
    const deviceInfo = {
      userAgent: req.get('User-Agent'),
      platform: req.get('Sec-CH-UA-Platform'),
      mobile: req.get('Sec-CH-UA-Mobile') === '?1'
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    return db.insert('user_sessions', {
      user_id: userId,
      refresh_token: refreshToken,
      access_token_id: accessTokenId,
      device_info: JSON.stringify(deviceInfo),
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      expires_at: expiresAt
    });
  },

  /**
   * Get active session
   */
  async getSession(refreshToken: string): Promise<UserSession | null> {
    return db.queryOne<UserSession>(
      'SELECT * FROM user_sessions WHERE refresh_token = ? AND is_active = TRUE AND expires_at > NOW()',
      [refreshToken]
    );
  },

  /**
   * Update session last used
   */
  async updateSessionLastUsed(sessionId: number): Promise<void> {
    await db.update(
      'user_sessions',
      { last_used_at: new Date() },
      { id: sessionId }
    );
  },

  /**
   * Invalidate session
   */
  async invalidateSession(refreshToken: string): Promise<void> {
    await db.update(
      'user_sessions',
      { is_active: false },
      { refresh_token: refreshToken }
    );
  },

  /**
   * Invalidate all user sessions
   */
  async invalidateAllUserSessions(userId: number): Promise<void> {
    await db.update(
      'user_sessions',
      { is_active: false },
      { user_id: userId }
    );
  },

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions(): Promise<void> {
    await db.delete('user_sessions', { is_active: false });
    await db.query('DELETE FROM user_sessions WHERE expires_at < NOW()');
  },

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: number): Promise<void> {
    await db.update(
      'users',
      { last_login_at: new Date() },
      { id: userId }
    );
  }
};

/**
 * Authentication middleware
 */
export const authenticate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Get token from Authorization header
  const authHeader = req.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Get token from cookie if not in header
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    logSecurity('Missing authentication token', req.ip, req.get('User-Agent'), {
      url: req.originalUrl,
      method: req.method
    });
    throw new AuthenticationError('Authentication token required');
  }

  try {
    // Verify the token
    const payload = JwtUtils.verifyAccessToken(token);

    // Get user from database
    const user = await db.queryOne<User & Role>(
      `SELECT u.id, u.email, u.name, u.role_id, u.email_verified, u.is_active, u.last_login,
              r.name as role_name, r.permissions
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.is_active = TRUE`,
      [payload.userId]
    );

    if (!user) {
      logSecurity('User not found for valid token', req.ip, req.get('User-Agent'), {
        userId: payload.userId,
        email: payload.email
      });
      throw ErrorResponses.userNotFound();
    }

    // Check if account is active
    if (!user.is_active) {
      logSecurity('Inactive user attempted access', req.ip, req.get('User-Agent'), {
        userId: user.id,
        email: user.email
      });
      throw ErrorResponses.accountDeactivated();
    }

    // Handle permissions (already parsed by MySQL as array)
    let permissions: string[] = [];
    if (Array.isArray(user.permissions)) {
      permissions = user.permissions;
    } else if (typeof user.permissions === 'string') {
      try {
        permissions = JSON.parse(user.permissions) || [];
      } catch (error) {
        permissions = [];
      }
    } else {
      permissions = [];
    }

    // Set user in request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role_name,
      roleId: user.role_id,
      permissions,
      isVerified: user.email_verified,
      isActive: user.is_active
    };

    logAuth('Token verified', user.email, true, {
      userId: user.id,
      role: user.role_name
    });

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    
    logSecurity('Token verification failed', req.ip, req.get('User-Agent'), {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw ErrorResponses.invalidToken();
  }
});

/**
 * Optional authentication middleware (doesn't throw if no token)
 */
export const optionalAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authenticate(req, res, next);
  } catch (error) {
    // Continue without authentication
    next();
  }
});

/**
 * Authorization middleware - check if user has required permissions
 */
export const authorize = (...requiredPermissions: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Admin has all permissions
    if (req.user.role === 'admin' || req.user.permissions.includes('*')) {
      return next();
    }

    // Check if user has required permissions
    const hasPermission = requiredPermissions.some(permission => 
      req.user!.permissions.includes(permission)
    );

    if (!hasPermission) {
      logSecurity('Insufficient permissions', req.ip, req.get('User-Agent'), {
        userId: req.user.id,
        role: req.user.role,
        requiredPermissions,
        userPermissions: req.user.permissions
      });
      throw ErrorResponses.insufficientPermissions();
    }

    next();
  });
};

/**
 * Role-based authorization middleware
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      logSecurity('Role not authorized', req.ip, req.get('User-Agent'), {
        userId: req.user.id,
        userRole: req.user.role,
        allowedRoles
      });
      throw ErrorResponses.insufficientPermissions();
    }

    next();
  });
};

/**
 * Email verification middleware
 */
export const requireEmailVerification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (!req.user.isVerified) {
    throw ErrorResponses.emailNotVerified();
  }

  next();
});

/**
 * Rate limiting by user
 */
export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<number, { count: number; resetTime: number }>();

  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const now = Date.now();
    const userLimit = userRequests.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      userRequests.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      logSecurity('Rate limit exceeded by user', req.ip, req.get('User-Agent'), {
        userId,
        count: userLimit.count,
        maxRequests
      });
      throw new ValidationError('Too many requests. Please try again later.');
    }

    userLimit.count++;
    next();
  });
};

/**
 * Admin-only authorization middleware
 */
export const requireAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  if (req.user.role !== 'admin') {
    logSecurity('Non-admin user attempted admin access', req.ip, req.get('User-Agent'), {
      userId: req.user.id,
      userRole: req.user.role,
      attemptedRoute: req.originalUrl
    });
    throw new AuthorizationError('Admin access required');
  }

  next();
});

/**
 * Combined auth + admin middleware for admin routes
 */
export const authenticateAdmin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // First authenticate the user
  await new Promise<void>((resolve, reject) => {
    authenticate(req, res, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  // Then check admin role
  await requireAdmin(req, res, next);
});

/**
 * Ownership authorization - check if user owns the resource
 */
export const authorizeOwnership = (getUserIdFromResource: (req: Request) => Promise<number>) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Admin can access anything
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceUserId = await getUserIdFromResource(req);
    
    if (resourceUserId !== req.user.id) {
      logSecurity('Unauthorized resource access attempt', req.ip, req.get('User-Agent'), {
        userId: req.user.id,
        resourceUserId,
        resource: req.originalUrl
      });
      throw ErrorResponses.insufficientPermissions();
    }

    next();
  });
};

export default {
  JwtUtils,
  PasswordUtils,
  SessionUtils,
  authenticate,
  optionalAuth,
  authorize,
  authorizeRoles,
  requireEmailVerification,
  rateLimitByUser,
  authorizeOwnership,
  requireAdmin,
  authenticateAdmin
};