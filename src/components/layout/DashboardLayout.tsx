'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F3F3EE] dark:bg-[#111827]" style={{ fontFamily: "'Myriad Pro', sans-serif" }}>
        <Sidebar />
        {/* pt-16 на мобильных для header, lg:pt-0 на десктопе */}
        {/* ml-0 на мобильных, lg:ml-56 на десктопе для sidebar */}
        <main className="pt-16 lg:pt-0 lg:ml-56 min-h-screen">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
