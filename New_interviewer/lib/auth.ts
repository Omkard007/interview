import { randomUUID } from 'crypto';
import * as crypto from 'crypto';

const SESSIONS: Map<string, { userId: string; expiresAt: number }> = new Map();

// Simple password hashing using crypto (salt + hash)
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [salt, stored] = hash.split(':');
    const computed = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
    return computed === stored;
  } catch (error) {
    return false;
  }
}

export function createSessionToken(): string {
  return randomUUID();
}

export function createSession(userId: string): string {
  const token = createSessionToken();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  
  SESSIONS.set(token, { userId, expiresAt });
  return token;
}

export function validateSession(token: string): string | null {
  const session = SESSIONS.get(token);
  
  if (!session) {
    return null;
  }
  
  if (Date.now() > session.expiresAt) {
    SESSIONS.delete(token);
    return null;
  }
  
  return session.userId;
}

export function destroySession(token: string): void {
  SESSIONS.delete(token);
}

export function getSessionFromCookie(cookieString: string): string | null {
  const cookies = cookieString.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'session_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}
