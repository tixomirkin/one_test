import jwt from 'jsonwebtoken';
import * as jose from 'jose';
import { serialize } from 'cookie';
import { APP_CONFIG } from './config';

export interface UserPayload {
  id: number;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

// JWT Secret for jose library
const jwtSecret = new TextEncoder().encode(JWT_SECRET);

/**
 * Creates a JWT token for a user
 */
export function createToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: APP_CONFIG.jwt.expiresIn });
}

/**
 * Verifies a JWT token using jsonwebtoken library
 */
export function verifyToken(token: string): UserPayload {
  return jwt.verify(token, JWT_SECRET) as UserPayload;
}

/**
 * Verifies a JWT token using jose library (for middleware)
 */
export async function verifyTokenJose(token: string): Promise<UserPayload> {
  const { payload } = await jose.jwtVerify<UserPayload>(token, jwtSecret);
  return {
    id: typeof payload.id === 'string' ? parseInt(payload.id, 10) : payload.id,
    email: payload.email,
  };
}

/**
 * Creates a cookie string for the token
 */
export function createTokenCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return serialize(APP_CONFIG.cookie.name, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: APP_CONFIG.cookie.maxAge,
  });
}

/**
 * Extracts token from cookie string
 */
export function extractTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const token = cookieHeader
    .split('; ')
    .find((c) => c.startsWith(`${APP_CONFIG.cookie.name}=`))
    ?.split('=')[1];

  return token || null;
}

