import { NextFunction, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { logAction } from '../utils/auditLog';
import { loginSchema } from '../schemas/auth.schema';
import { getUser, lockUserOnFailure, releaseLoginLock } from '../services/auth.service';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'access-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-me';

export interface AuthPayload {
  sub: string;
  role: Role;
  departmentId: string | null;
}


export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ errors: result.error.flatten() });
            return;
        }

        const { username, password } = result.data;

        const user = await getUser(username);

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
            const isLocked = await lockUserOnFailure(user);
            if (isLocked) {
                res.status(423).json({ message: 'Invalid credentials, your account has been locked for 15 minutes. please try again later' });
                return;
            }
            else {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }

        }

        // On Successful Login
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await releaseLoginLock(user.id);

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


    }
    catch (error) {
        next(error);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        await logAction({
            userId: req.user!.id,
            action: 'LOGOUT',
            ipAddress: req.ip
        });

        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out' });
    }
    catch (error) {
        next(error);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
    try {
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
        } catch (error) {
            res.status(401).json({ message: 'Invalid session' });
            throw error;
        }
    }

    catch (error) {
        next(error);
    }


};

export async function getMe(req: Request, res: Response, next: NextFunction) {

    try {
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

    }
    catch (error) {
        next(error);
    }

};





export const generateAccessToken = (user: User): string => {
  return jwt.sign(
    { sub: user.id, role: user.role, departmentId: user.departmentId },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = (user: User): string => {
  return jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): AuthPayload => {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
};

export const verifyRefreshToken = (token: string): { sub: string } => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { sub: string };
};

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, 12); // Cost factor 12
};

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};
