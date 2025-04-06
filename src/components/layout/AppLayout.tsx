
import React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-100">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16 flex items-center px-6 lg:px-8">
            <SidebarTrigger className="mr-4" />
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-inventory-blue-light flex items-center justify-center text-inventory-blue font-semibold">
                  AT
                </div>
                <span className="hidden sm:inline text-sm font-medium">Admin Tenant</span>
              </div>
            </div>
          </header>
          <main className={cn(
            "flex-1 overflow-auto p-6 lg:p-8 bg-gray-100"
          )}>
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
