import { Request } from 'express';
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
/**
 * JWT utility functions
 */
export declare const JwtUtils: {
    /**
     * Generate access token
     */
    generateAccessToken(payload: Omit<JwtPayload, "type">): string;
    /**
     * Generate refresh token
     */
    generateRefreshToken(payload: Omit<JwtPayload, "type">): string;
    /**
     * Verify access token
     */
    verifyAccessToken(token: string): JwtPayload;
    /**
     * Verify refresh token
     */
    verifyRefreshToken(token: string): JwtPayload;
    /**
     * Generate both access and refresh tokens
     */
    generateTokens(payload: {
        userId: number;
        email: string;
    }): {
        accessToken: string;
        refreshToken: string;
    };
    /**
     * Generate a secure random token
     */
    generateSecureToken(): string;
};
/**
 * Password utility functions
 */
export declare const PasswordUtils: {
    /**
     * Hash password
     */
    hash(password: string): Promise<string>;
    /**
     * Compare password with hash
     */
    compare(password: string, hash: string): Promise<boolean>;
    /**
     * Validate password strength
     */
    validate(password: string): {
        isValid: boolean;
        errors: string[];
    };
};
/**
 * Session management functions
 */
export declare const SessionUtils: {
    /**
     * Create user session
     */
    createSession(userId: number, refreshToken: string, accessTokenId: string, req: Request): Promise<number>;
    /**
     * Get active session
     */
    getSession(refreshToken: string): Promise<UserSession | null>;
    /**
     * Update session last used
     */
    updateSessionLastUsed(sessionId: number): Promise<void>;
    /**
     * Invalidate session
     */
    invalidateSession(refreshToken: string): Promise<void>;
    /**
     * Invalidate all user sessions
     */
    invalidateAllUserSessions(userId: number): Promise<void>;
    /**
     * Clean expired sessions
     */
    cleanExpiredSessions(): Promise<void>;
    /**
     * Update user's last login timestamp
     */
    updateLastLogin(userId: number): Promise<void>;
};
/**
 * Authentication middleware
 */
export declare const authenticate: (req: any, res: any, next: any) => void;
/**
 * Optional authentication middleware (doesn't throw if no token)
 */
export declare const optionalAuth: (req: any, res: any, next: any) => void;
/**
 * Authorization middleware - check if user has required permissions
 */
export declare const authorize: (...requiredPermissions: string[]) => (req: any, res: any, next: any) => void;
/**
 * Role-based authorization middleware
 */
export declare const authorizeRoles: (...allowedRoles: string[]) => (req: any, res: any, next: any) => void;
/**
 * Email verification middleware
 */
export declare const requireEmailVerification: (req: any, res: any, next: any) => void;
/**
 * Rate limiting by user
 */
export declare const rateLimitByUser: (maxRequests: number, windowMs: number) => (req: any, res: any, next: any) => void;
/**
 * Admin-only authorization middleware
 */
export declare const requireAdmin: (req: any, res: any, next: any) => void;
/**
 * Combined auth + admin middleware for admin routes
 */
export declare const authenticateAdmin: (req: any, res: any, next: any) => void;
/**
 * Ownership authorization - check if user owns the resource
 */
export declare const authorizeOwnership: (getUserIdFromResource: (req: Request) => Promise<number>) => (req: any, res: any, next: any) => void;
declare const _default: {
    JwtUtils: {
        /**
         * Generate access token
         */
        generateAccessToken(payload: Omit<JwtPayload, "type">): string;
        /**
         * Generate refresh token
         */
        generateRefreshToken(payload: Omit<JwtPayload, "type">): string;
        /**
         * Verify access token
         */
        verifyAccessToken(token: string): JwtPayload;
        /**
         * Verify refresh token
         */
        verifyRefreshToken(token: string): JwtPayload;
        /**
         * Generate both access and refresh tokens
         */
        generateTokens(payload: {
            userId: number;
            email: string;
        }): {
            accessToken: string;
            refreshToken: string;
        };
        /**
         * Generate a secure random token
         */
        generateSecureToken(): string;
    };
    PasswordUtils: {
        /**
         * Hash password
         */
        hash(password: string): Promise<string>;
        /**
         * Compare password with hash
         */
        compare(password: string, hash: string): Promise<boolean>;
        /**
         * Validate password strength
         */
        validate(password: string): {
            isValid: boolean;
            errors: string[];
        };
    };
    SessionUtils: {
        /**
         * Create user session
         */
        createSession(userId: number, refreshToken: string, accessTokenId: string, req: Request): Promise<number>;
        /**
         * Get active session
         */
        getSession(refreshToken: string): Promise<UserSession | null>;
        /**
         * Update session last used
         */
        updateSessionLastUsed(sessionId: number): Promise<void>;
        /**
         * Invalidate session
         */
        invalidateSession(refreshToken: string): Promise<void>;
        /**
         * Invalidate all user sessions
         */
        invalidateAllUserSessions(userId: number): Promise<void>;
        /**
         * Clean expired sessions
         */
        cleanExpiredSessions(): Promise<void>;
        /**
         * Update user's last login timestamp
         */
        updateLastLogin(userId: number): Promise<void>;
    };
    authenticate: (req: any, res: any, next: any) => void;
    optionalAuth: (req: any, res: any, next: any) => void;
    authorize: (...requiredPermissions: string[]) => (req: any, res: any, next: any) => void;
    authorizeRoles: (...allowedRoles: string[]) => (req: any, res: any, next: any) => void;
    requireEmailVerification: (req: any, res: any, next: any) => void;
    rateLimitByUser: (maxRequests: number, windowMs: number) => (req: any, res: any, next: any) => void;
    authorizeOwnership: (getUserIdFromResource: (req: Request) => Promise<number>) => (req: any, res: any, next: any) => void;
    requireAdmin: (req: any, res: any, next: any) => void;
    authenticateAdmin: (req: any, res: any, next: any) => void;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map