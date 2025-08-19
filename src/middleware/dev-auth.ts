import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';

/**
 * Development authentication middleware for file-based users
 * Used when database is not available
 */
export async function devAuthenticate(req: Request, res: Response, next: NextFunction) {
  try {
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
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
        code: 'AUTHENTICATION_ERROR'
      });
    }

    // Verify the token
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';
    const payload: any = jwt.verify(token, JWT_SECRET);

    // Load user from file
    const usersFile = path.join(process.cwd(), 'data', 'fallback-users.json');
    const usersData = JSON.parse(await fs.readFile(usersFile, 'utf8'));
    
    const user = usersData.find((u: any) => u.id === payload.userId && u.is_active);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'AUTHENTICATION_ERROR'
      });
    }

    // Set user in request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roleId: user.role_id || (user.role === 'admin' ? 3 : user.role === 'instructor' ? 2 : 1),
      permissions: user.role === 'admin' ? ['*'] : [],
      isVerified: user.email_verified,
      isActive: user.is_active
    };

    console.log(`🔍 Dev Auth: User ${user.email} authenticated with role ${user.role}`);
    next();

  } catch (error) {
    console.error('❌ Dev authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTHENTICATION_ERROR'
    });
  }
}

/**
 * Development admin authorization middleware
 */
export function devRequireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'AUTHENTICATION_ERROR'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
      code: 'AUTHORIZATION_ERROR'
    });
  }

  next();
}

/**
 * Combined dev auth + admin middleware
 */
export async function devAuthenticateAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // First authenticate the user - use custom logic to avoid double response
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
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
        code: 'AUTHENTICATION_ERROR'
      });
    }

    // Verify the token
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_this_in_production';
    const payload: any = jwt.verify(token, JWT_SECRET);

    // Load user from file
    const usersFile = path.join(process.cwd(), 'data', 'fallback-users.json');
    const usersData = JSON.parse(await fs.readFile(usersFile, 'utf8'));
    
    const user = usersData.find((u: any) => u.id === payload.userId && u.is_active);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'AUTHENTICATION_ERROR'
      });
    }

    // Check admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        code: 'AUTHORIZATION_ERROR'
      });
    }

    // Set user in request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      roleId: user.role_id || (user.role === 'admin' ? 3 : user.role === 'instructor' ? 2 : 1),
      permissions: user.role === 'admin' ? ['*'] : [],
      isVerified: user.email_verified,
      isActive: user.is_active
    };

    console.log(`🔍 Dev Auth: Admin user ${user.email} authenticated`);
    next();

  } catch (error) {
    console.error('❌ Dev admin auth error:', error);
    if (!res.headersSent) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
        code: 'AUTHENTICATION_ERROR'
      });
    }
  }
}