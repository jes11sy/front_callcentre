'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useCallbackReminder } from '@/hooks/useCallbackReminder';

interface DashboardLayoutProps {
  children: ReactNode;
  variant?: string;
  requiredRole?: string;
}
export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  useCallbackReminder();

  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <div className="min-h-screen bg-[#F3F3EE] dark:bg-[#111113]" style={{ fontFamily: "'Myriad Pro', sans-serif" }}>
        <Sidebar />
        <main className="cc-main-content pt-16 lg:pt-0 min-h-screen">
          {children}
        </main>
      </div>

    </ProtectedRoute>
  );
}
