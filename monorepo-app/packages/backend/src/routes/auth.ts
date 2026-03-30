import { Request, Response } from 'express';
import { router } from '../lib/prisma';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';
import { logAction } from '../utils/auditLog';
import { 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from '../utils/auth';


const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.flatten() });
    return;
  }

  const { username, password } = result.data;
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !user.isActive) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  // Handle Account Lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    res.status(423).json({ message: 'Account locked for 15 minutes' });
    return;
  }

  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= 5;
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null
      }
    });

    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  // On Successful Login
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date()
    }
  });

  await logAction({
    userId: user.id,
    action: 'LOGIN',
    ipAddress: req.ip
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    accessToken,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      departmentId: user.departmentId
    }
  });
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  await logAction({
    userId: req.user!.id,
    action: 'LOGOUT',
    ipAddress: req.ip
  });

  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out' });
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ message: 'Session expired' });
    return;
  }

  try {
    const decoded = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user || !user.isActive) throw new Error();

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: 'Invalid session' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      username: true,
      fullName: true,
      email: true,
      role: true,
      departmentId: true,
      isActive: true
    }
  });
  res.json(user);
});

export default router;