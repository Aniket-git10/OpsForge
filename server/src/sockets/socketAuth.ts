import { Socket } from 'socket.io';
import { verifyToken, TokenPayload } from '../utils/jwt.js';

export interface AuthenticatedSocket extends Socket {
  user?: TokenPayload;
}

export const socketAuthMiddleware = (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(' ')[1] ||
      socket.handshake.query?.token;

    if (!token || typeof token !== 'string') {
      return next(new Error('Authentication token required for Socket connection'));
    }

    const decoded = verifyToken(token);
    socket.user = decoded;
    next();
  } catch (err: any) {
    next(new Error(`Socket authentication failed: ${err.message}`));
  }
};
