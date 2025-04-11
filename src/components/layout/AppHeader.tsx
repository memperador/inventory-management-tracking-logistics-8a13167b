
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { UserNav } from './UserNav';
import { MenuIcon, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useRole } from '@/hooks/useRoleContext';
import { UserRole } from '@/types/roles';
import { Badge } from '@/components/ui/badge';

const getRoleBadgeColor = (role: UserRole | null) => {
  switch (role) {
    case 'admin':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'manager':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'editor':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'viewer':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'superadmin':
      return 'bg-purple-100 text-purple-700 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
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
  
  const handleRoleRefresh = () => {
    refreshRole();
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
            <div className="hidden md:flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`${getRoleBadgeColor(userRole)} px-3 py-1 text-xs font-medium cursor-pointer`}
                onClick={handleRoleRefresh}
              >
                {userRole?.toUpperCase()}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={handleRoleRefresh}
              >
                Refresh Role
              </Button>
            </div>
          )}
          <UserNav />
        </div>
      </div>
    </header>
  );
}
