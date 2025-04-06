
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/hooks/useTenantContext';
import { useRole } from '@/hooks/useRoleContext'; 
import { useTheme } from '@/hooks/useThemeContext';
import { Menu, X, Sun, Moon, User, MailCheck, Mail } from 'lucide-react';
import { AppSidebar } from './AppSidebar';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { currentRole } = useRole();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
            <span className="font-bold text-lg text-gray-900 dark:text-white">FleetTrack</span>
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
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            
            <div className="flex items-center gap-2 ml-2">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.email}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {currentRole}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                aria-label="User menu"
              >
                <User size={20} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden sm:inline-flex"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-grow">
        <div
          className={`${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 fixed md:static top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-transform duration-300 ease-in-out w-64 pt-16 md:pt-0`}
        >
          <AppSidebar />
        </div>

        <div className="flex-grow w-full md:w-auto">
          <main className="p-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
