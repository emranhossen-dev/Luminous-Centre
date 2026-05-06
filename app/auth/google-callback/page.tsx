'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuth } from '@/lib/google-oauth';

export default function GoogleCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userStr = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      router.push('/auth/login?error=' + error);
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Store in localStorage for AuthContext
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Get redirect parameters from session storage (if any)
        const redirect = sessionStorage.getItem('auth_redirect');
        const course = sessionStorage.getItem('auth_course');
        
        // Clean up session storage
        sessionStorage.removeItem('auth_redirect');
        sessionStorage.removeItem('auth_course');
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Handle redirect logic
        if (redirect === 'enroll') {
          router.push('/courses');
          return;
        } else if (redirect === 'course' && course) {
          router.push(`/courses/${course}`);
          return;
        }
        
        // Redirect to appropriate dashboard
        switch (user.roleName) {
          case 'admin':
            router.push('/admin');
            break;
          case 'mentor':
            router.push('/mentor');
            break;
          case 'employee':
            router.push('/employee');
            break;
          case 'student':
            router.push('/student');
            break;
          default:
            router.push('/courses');
        }
      } catch (err) {
        console.error('Failed to parse user data:', err);
        router.push('/auth/login?error=Failed to parse user data');
      }
    } else {
      // Try popup method
      GoogleOAuth.handleCallback();
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0b0c17] flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p>Completing authentication...</p>
      </div>
    </div>
  );
}
