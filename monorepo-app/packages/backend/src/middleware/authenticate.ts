import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../controllers/auth.controller';


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      departmentId: decoded.departmentId,
    };

    req.log = req.log.child({
      userId: req.user.id,
      role: req.user.role,
    });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};