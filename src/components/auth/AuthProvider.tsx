'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/auth';
import { TokenRefresher } from './TokenRefresher';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = await authApi.getUser();
        const isAuthenticated = await authApi.isAuthenticated();

        if (storedUser && isAuthenticated) {
          try {
            const profile = await authApi.getProfile();
            setUser(profile.data);
          } catch {
            await authApi.logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setUser, setLoading]);

  return (
    <>
      <TokenRefresher />
      {children}
    </>
  );
}
