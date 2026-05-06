import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: number;
  email: string;
  roleId: number;
  roleName: string;
  permissions: string[];
}

export function withAdminAuth(handler: (req: NextRequest, context: any, user: JWTPayload) => Promise<NextResponse>) {
  return async (req: NextRequest, context: any) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      // Check if user is admin
      if (decoded.roleName !== 'admin') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }

      // Call the handler with user context
      return handler(req, context, decoded);
    } catch (error) {
      console.error('Admin auth error:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

// Client-side admin auth check
export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) return false;
  
  try {
    const user = JSON.parse(userStr);
    return user.roleName === 'admin';
  } catch {
    return false;
  }
}

// Redirect to admin login if not authenticated
export function requireAdminAuth() {
  if (typeof window !== 'undefined' && !isAdminAuthenticated()) {
    window.location.href = '/admin/login';
    return false;
  }
  return true;
}
