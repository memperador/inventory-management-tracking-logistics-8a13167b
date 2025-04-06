
import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/hooks/useTenantContext';
import { useRole } from '@/hooks/useRoleContext'; 
import { useTheme } from '@/hooks/useThemeContext';
import { Menu, X, Sun, Moon, User, MailCheck, Mail, LogOut, Settings } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const EmailVerificationIndicator = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const isEmailVerified = user.email_confirmed_at || user.email_confirmed_at !== null;
  
  return isEmailVerified ? (
    <div className="flex items-center text-xs text-green-600">
      <MailCheck className="h-3 w-3 mr-1" />
      <span>Verified</span>
    </div>
  ) : (
    <div className="flex items-center text-xs text-yellow-600">
      <Mail className="h-3 w-3 mr-1" />
      <span>Unverified</span>
    </div>
  );
};

const AppLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { currentTenant } = useTenant();
  const { userRole } = useRole();
  const { currentTheme, setTheme } = useTheme();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleToggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleMenu}
              className="md:hidden"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                {currentTenant?.name || 'FleetTrack'}
              </span>
              {currentTenant && (
                <span className="text-xs text-gray-500">
                  {userRole} Access
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <EmailVerificationIndicator />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              className="ml-2"
              aria-label="Toggle theme"
            >
              {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.email}</span>
                    <span className="text-xs text-gray-500">{userRole}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account" className="cursor-pointer flex w-full items-center">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer flex w-full items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-grow">
        <SidebarProvider defaultOpen={!isMobile}>
          <div className={`${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:static top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-transform duration-300 ease-in-out w-64 pt-16 md:pt-0`}>
            <AppSidebar />
          </div>

          <div className="flex-grow w-full md:w-auto">
            <main className="p-0">
              <Outlet />
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default AppLayout;
