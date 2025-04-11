
import React from 'react';
import { AppHeader } from './AppHeader';
import AppSidebar from './AppSidebar';
import { useAuth } from '@/contexts/auth';
import DebugPanel from '@/components/debug/DebugPanel';
import { SidebarProvider } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader toggleMenu={() => {}} isMenuOpen={false} />
          <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-4">
            {children}
          </main>
          <DebugPanel />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
