'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useCallbackReminder } from '@/hooks/useCallbackReminder';

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
  useCallbackReminder();

  return (
    <div className="min-h-screen bg-[#F3F3EE] dark:bg-[#111827]" style={{ fontFamily: "'Myriad Pro', sans-serif" }}>
      <Sidebar />
      <main className="pt-16 lg:pt-0 lg:ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <DashboardContent>{children}</DashboardContent>
    </ProtectedRoute>
  );
}
