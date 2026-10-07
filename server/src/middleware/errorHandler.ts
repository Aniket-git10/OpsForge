import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log unexpected errors
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Error Handler]', err);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    sendError(res, `Invalid format for resource ID: ${err.value}`, 400);
    return;
  }

  // Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    sendError(res, `A record with this ${field} already exists`, 409);
    return;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    sendError(res, 'Validation error', 400, messages);
    return;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token signature', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token has expired', 401);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  sendError(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};
