import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from './auth';

// Authentication middleware for API routes
export async function withAuth(
  handler: (req: NextRequest, context: any, user: any) => Promise<NextResponse>,
  options: { permissions?: string[] } = {}
) {
  return async (req: NextRequest, context: any) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      
      // Verify token
      const payload = verifyToken(token);
      
      // Get full user data
      const user = await getUserById(payload.userId);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 401 }
        );
      }

      // Check permissions if specified
      if (options.permissions && options.permissions.length > 0) {
        const hasRequiredPermission = options.permissions.some(permission => 
          user.permissions.includes('*') || user.permissions.includes(permission)
        );

        if (!hasRequiredPermission) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Add user to request context
      (req as any).user = user;

      // Call the handler with user context
      return await handler(req, context, user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }
  };
}

// Role-based middleware helper
export function requireRole(roles: string[]) {
  return (handler: (req: NextRequest, context: any, user: any) => Promise<NextResponse>) => {
    return withAuth(handler, {
      permissions: roles.map(role => `role.${role}`)
    });
  };
}

// Permission-based middleware helper
export function requirePermission(permissions: string[]) {
  return (handler: (req: NextRequest, context: any, user: any) => Promise<NextResponse>) => {
    return withAuth(handler, { permissions });
  };
}

// Extract user from request (for routes that don't require auth but may use user info)
export async function getUserFromRequest(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    return await getUserById(payload.userId);
  } catch (error) {
    return null;
  }
}
