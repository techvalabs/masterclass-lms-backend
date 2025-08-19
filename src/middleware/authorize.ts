import { Request, Response, NextFunction } from 'express';

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).userRole;
    
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. No role found.'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

export default authorize;