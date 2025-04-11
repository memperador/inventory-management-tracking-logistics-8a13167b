
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';
import { MenuIcon, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useRole } from '@/hooks/useRoleContext';
import { UserRole } from '@/types/roles';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const getRoleBadgeColor = (role: UserRole | null) => {
  switch (role) {
    case 'admin':
      return 'bg-blue-500 text-white border-blue-600 hover:bg-blue-600';
    case 'manager':
      return 'bg-green-500 text-white border-green-600 hover:bg-green-600';
    case 'editor':
      return 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600';
    case 'viewer':
      return 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600';
    case 'superadmin':
      return 'bg-purple-500 text-white border-purple-600 hover:bg-purple-600';
    default:
      return 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600';
  }
};

interface HeaderProps {
  toggleMenu: () => void;
  isMenuOpen: boolean;
}

export function AppHeader({ toggleMenu, isMenuOpen }: HeaderProps) {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { userRole, refreshRole } = useRole();
  
  const handleRoleRefresh = async () => {
    await refreshRole();
    
    // Hard reload if email is labrat and not admin yet
    if (user?.email === 'labrat@iaware.com' && userRole !== 'admin') {
      toast({
        title: 'Refreshing Page',
        description: 'Reloading page to apply role changes...',
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-gray-950 border-b">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center sm:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <MenuIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center justify-end flex-1 space-x-4">
          {userRole && (
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`${getRoleBadgeColor(userRole)} px-3 py-1 text-xs font-medium cursor-pointer uppercase`}
                onClick={handleRoleRefresh}
              >
                {userRole}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs flex items-center"
                onClick={handleRoleRefresh}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          )}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
