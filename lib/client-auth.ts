import { JWTPayload } from './auth';

// Client-side authentication helpers
export class ClientAuth {
  // Get token from localStorage
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  // Save token to localStorage
  static saveToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  }

  // Remove token from localStorage
  static removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }

  // Parse JWT token (client-side only, no verification)
  static parseToken(token: string): JWTPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  // Get current user from token
  static getCurrentUser(): JWTPayload | null {
    const token = this.getToken();
    if (!token) return null;
    return this.parseToken(token);
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const payload = this.parseToken(token);
    if (!payload) return false;
    
    // Check if token is expired (optional - basic check)
    const now = Math.floor(Date.now() / 1000);
    // Note: JWT tokens have exp field, but we're not verifying it here for simplicity
    return true;
  }

  // Check if user has specific role
  static hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    return user?.roleName === roleName;
  }

  // Check if user is admin
  static isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Check if user is student
  static isStudent(): boolean {
    return this.hasRole('student');
  }

  // Check if user is mentor
  static isMentor(): boolean {
    return this.hasRole('mentor');
  }

  // Check if user is employee
  static isEmployee(): boolean {
    return this.hasRole('employee');
  }

  // Redirect to login if not authenticated
  static requireAuth(): void {
    if (!this.isAuthenticated()) {
      window.location.href = '/auth/login';
    }
  }

  // Redirect to specific page if not authenticated
  static requireAuthWithRedirect(redirectUrl: string): void {
    if (!this.isAuthenticated()) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`;
    }
  }

  // Handle enrollment click
  static handleEnrollmentClick(e: React.MouseEvent): void {
    e.preventDefault();
    
    if (!this.isAuthenticated()) {
      // Redirect to login with enrollment intent
      window.location.href = '/auth/login?redirect=enroll';
      return;
    }

    // Redirect to courses page for logged-in users
    window.location.href = '/courses';
  }

  // Handle course view click
  static handleCourseViewClick(e: React.MouseEvent, courseSlug: string): void {
    e.preventDefault();
    
    if (!this.isAuthenticated()) {
      // Redirect to login with course view intent
      window.location.href = `/auth/login?redirect=course&course=${courseSlug}`;
      return;
    }

    // Redirect to course detail page for logged-in users
    window.location.href = `/courses/${courseSlug}`;
  }
}
