import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      sendError(
        res,
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
        403
      );
      return;
    }

    next();
  };
};
