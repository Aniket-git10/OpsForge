import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { sendError } from '../utils/apiResponse.js';
import { User, IUser } from '../models/User.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  organization?: string;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Check HTTP-only cookie
      token = req.cookies.token;
    }

    if (!token) {
      sendError(res, 'Authentication required. Please log in.', 401);
      return;
    }

    const decoded: TokenPayload = verifyToken(token);

    // Ensure user still exists
    const user = await User.findById(decoded.id).select('name email role organization');
    if (!user) {
      sendError(res, 'User account no longer exists', 401);
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      organization: user.organization?.toString(),
      name: user.name,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      sendError(res, 'Session expired. Please log in again.', 401);
      return;
    }
    sendError(res, 'Invalid authentication token', 401);
  }
};
