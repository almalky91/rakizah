/**
 * ProtectedRoute component
 * Handles authentication checks and loading states for protected pages
 * Shows loading UI while NextAuth session initializes
 * Redirects to login if user is not authenticated
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional role requirement for additional authorization */
  requiredRole?: string | string[];
  /** Custom loading text */
  loadingText?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  loadingText = 'جاري التحقق من الصلاحيات...'
}: ProtectedRouteProps) {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for session to load before checking authentication
    if (loading) return;

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    // Check role requirement if specified
    if (requiredRole && userRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!allowedRoles.includes(userRole)) {
        // Redirect to dashboard if role doesn't match
        router.push('/dashboard');
      }
    }
  }, [loading, user, userRole, requiredRole, router]);

  // Show loading UI while session initializes
  if (loading) {
    return <LoadingSpinner fullScreen size="lg" text={loadingText} />;
  }

  // Don't render content if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Check role requirement before rendering
  if (requiredRole && userRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(userRole)) {
      return null; // Will redirect via useEffect
    }
  }

  // User is authenticated and authorized, render children
  return <>{children}</>;
}
