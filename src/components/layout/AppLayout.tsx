
import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';

const AppLayout = () => {
  const { user, loading, signOut } = useAuth();
  const { userRole, isRoleLoading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || isRoleLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-inventory-blue border-t-transparent"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'bg-inventory-blue-light text-inventory-blue';
      case 'manager':
        return 'bg-inventory-green-light text-inventory-green';
      case 'operator':
        return 'bg-inventory-yellow-light text-inventory-yellow';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-100">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6 lg:px-8">
            <SidebarTrigger className="mr-4" />
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-inventory-blue-light flex items-center justify-center text-inventory-blue font-semibold">
                  {user?.user_metadata?.first_name?.[0]}{user?.user_metadata?.last_name?.[0] || ''}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-medium">
                    {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                  </span>
                  {userRole && (
                    <Badge variant="secondary" className={`text-xs ${getRoleBadgeColor(userRole)}`}>
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => signOut()}
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className={cn(
            "flex-1 overflow-auto p-4 md:p-6 lg:p-8 bg-gray-100"
          )}>
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
