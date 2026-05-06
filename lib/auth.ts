import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './database';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleId: number;
  roleName: string;
  permissions: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface JWTPayload {
  userId: number;
  email: string;
  roleId: number;
  roleName: string;
  permissions: string[];
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return await bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }
  return await bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    roleId: user.roleId,
    roleName: user.roleName,
    permissions: user.permissions
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  } as jwt.SignOptions);
}

// Generate refresh token
export function generateRefreshToken(user: User): string {
  const payload = { userId: user.id, type: 'refresh' };
  
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  } as jwt.SignOptions);
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    throw new Error('Invalid token');
  }
}

// Get user by ID with role and permissions
export async function getUserById(id: number): Promise<User | null> {
  const result = await query(`
    SELECT 
      u.id,
      u.email,
      u.first_name as "firstName",
      u.last_name as "lastName",
      u.phone,
      u.role_id as "roleId",
      u.is_active as "isActive",
      u.email_verified as "emailVerified",
      u.last_login as "lastLogin",
      u.created_at as "createdAt",
      r.name as "roleName",
      r.permissions
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = $1 AND u.is_active = true
  `, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as User;
}

// Get user by email with role and permissions
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(`
    SELECT 
      u.id,
      u.email,
      u.first_name as "firstName",
      u.last_name as "lastName",
      u.phone,
      u.role_id as "roleId",
      u.is_active as "isActive",
      u.email_verified as "emailVerified",
      u.last_login as "lastLogin",
      u.created_at as "createdAt",
      r.name as "roleName",
      r.permissions
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.email = $1 AND u.is_active = true
  `, [email]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0] as User;
}

// Check if user has specific permission
export function hasPermission(user: User, permission: string): boolean {
  // Admin has all permissions
  if (user.roleName === 'admin') {
    return true;
  }

  // Check for wildcard permission
  if (user.permissions.includes('*')) {
    return true;
  }

  // Check for specific permission
  return user.permissions.includes(permission);
}

// Check if user has any of the specified permissions
export function hasAnyPermission(user: User, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

// Update last login
export async function updateLastLogin(userId: number): Promise<void> {
  await query(`
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP 
    WHERE id = $1
  `, [userId]);
}

// Log activity
export async function logActivity(
  userId: number,
  action: string,
  resourceType?: string,
  resourceId?: number,
  details?: any,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await query(`
    INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [userId, action, resourceType, resourceId, JSON.stringify(details), ipAddress, userAgent]);
}
