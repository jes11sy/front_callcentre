'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useDesignStore } from '@/store/designStore';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { version } = useDesignStore();

  // V2 Design - Vertical Sidebar
  if (version === 'v2') {
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

  // V1 Design - Horizontal Header
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0f0f23] flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
