// apps/backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { ApiError } from '../utils/ApiError';
import { verifyMessage } from '../utils/crypto';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new ApiError(401, 'Authorization header is required');
    }

    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new ApiError(401, 'Invalid authorization format');
    }

    const [address, signature, timestamp] = token.split(':');

    // Verify timestamp is within 5 minutes
    const now = Date.now();
    const msgTimestamp = parseInt(timestamp);
    if (now - msgTimestamp > 300000) {
      throw new ApiError(401, 'Signature expired');
    }

    // Verify signature
    const message = `Authenticate to Mental Health dApp: ${timestamp}`;
    const isValid = await verifyMessage(message, signature, address);

    if (!isValid) {
      throw new ApiError(401, 'Invalid signature');
    }

    req.user = { address };
    next();
  } catch (error) {
    next(error);
  }
};