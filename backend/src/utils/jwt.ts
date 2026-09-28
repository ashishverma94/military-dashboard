import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthUser } from '../types/auth.js';

export function signToken(user: AuthUser) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: '8h' });
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, env.JWT_SECRET) as AuthUser;
}
