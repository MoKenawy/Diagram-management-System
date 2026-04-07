import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';
export async function getUser(username: string) : Promise<User | null> {

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) return null;

  return user;
}

export async function lockUserOnFailure(user: User) : Promise<boolean> {
    const attempts = user.failedLoginAttempts + 1;
    const shouldLock = attempts >= 5;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null // Lock for 15 minutes
      }
    });
    if (shouldLock) {
      return true; // Account is now locked
    }

    return false;   
}

export async function releaseLoginLock(userID: string) : Promise<User | null> {

  const user = await prisma.user.update({
    where: { id: userID },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date()
    }
  });
  if (!user) return null;

  return user;

}
