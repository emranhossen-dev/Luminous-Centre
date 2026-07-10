// Role-Based Access Control (RBAC) System

export type Role = 'Super Admin' | 'Admin' | 'Mentor' | 'Employee' | 'Student';

// Define route prefixes mapped to allowed roles
export const RolePermissions: Record<string, Role[]> = {
  '/admin/super': ['Super Admin'],
  '/admin/staff': ['Super Admin', 'Admin'],
  '/admin/students': ['Super Admin', 'Admin'],
  '/admin/courses': ['Super Admin', 'Admin'],
  '/admin/quizzes': ['Super Admin', 'Admin'],
  '/admin': ['Super Admin', 'Admin', 'Employee'], // Dashboard access
  '/mentor': ['Mentor', 'Super Admin'],
  '/student': ['Student', 'Super Admin'],
  '/employee': ['Employee', 'Super Admin']
};

/**
 * Checks if a given role has access to a specific path.
 */
export function hasAccess(role: Role, path: string): boolean {
  if (role === 'Super Admin') return true;

  // Find matching route pattern
  for (const [route, allowedRoles] of Object.entries(RolePermissions)) {
    if (path.startsWith(route)) {
      return allowedRoles.includes(role);
    }
  }

  // Default to false if route requires specific permission not listed above
  return false;
}

export const ROLES = {
  SUPER_ADMIN: 'Super Admin' as Role,
  ADMIN: 'Admin' as Role,
  MENTOR: 'Mentor' as Role,
  EMPLOYEE: 'Employee' as Role,
  STUDENT: 'Student' as Role,
};
