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