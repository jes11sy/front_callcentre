'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'operator';
  allowedRoles?: ('admin' | 'operator')[];
}

export function ProtectedRoute({ children, requiredRole, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      // Check allowedRoles first, then requiredRole
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard if role is not in allowed roles
        if (user.role === 'operator') {
          router.push('/operator');
        } else {
          router.push('/admin');
        }
        return;
      }

      if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
        // Redirect to appropriate dashboard if role doesn't match
        if (user.role === 'operator') {
          router.push('/operator');
        } else {
          router.push('/admin');
        }
        return;
      }
    }
  }, [isAuthenticated, user, isLoading, requiredRole, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  // Check allowedRoles first, then requiredRole
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null; // Will redirect to appropriate dashboard
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return null; // Will redirect to appropriate dashboard
  }

  return <>{children}</>;
}
