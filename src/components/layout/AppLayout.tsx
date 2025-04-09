
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRoleContext';
import AppSidebar from './AppSidebar';
import { AppHeader } from './AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TrialBanner } from '@/components/subscription/TrialBanner';
import { SubscriptionExpiryBanner } from '@/components/subscription/SubscriptionExpiryBanner';

const AppLayout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const { userRole } = useRole();
  const isMobile = useIsMobile();

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCloseSidebar = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  // Add a body class when menu is open on mobile to prevent background scrolling
  useEffect(() => {
    if (isMobile && isMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobile, isMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <AppHeader toggleMenu={handleToggleMenu} isMenuOpen={isMenuOpen} />
      
      {/* Display subscription notifications */}
      <div className="px-4 md:px-6 mt-2 space-y-2">
        <TrialBanner />
        <SubscriptionExpiryBanner />
      </div>

      <div className="flex flex-grow">
        <SidebarProvider defaultOpen={!isMobile}>
          <div 
            className={`${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0 fixed md:static top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transition-transform duration-300 ease-in-out w-64 pt-16 md:pt-0`}
          >
            <AppSidebar closeSidebar={handleCloseSidebar} />
          </div>

          {/* Add overlay when mobile menu is open */}
          {isMobile && isMenuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={handleCloseSidebar}
            />
          )}

          <div className="flex-grow w-full md:w-auto" onClick={isMobile ? handleCloseSidebar : undefined}>
            <main className="p-0 pb-20 md:pb-0">
              <Outlet />
            </main>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default AppLayout;
