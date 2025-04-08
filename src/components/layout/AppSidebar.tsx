
import React from 'react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarNavGroup } from './sidebar/SidebarNavGroup';
import { SidebarFooterContent } from './sidebar/SidebarFooterContent';
import { 
  dashboardNavigation, 
  managementNavigation, 
  operationsNavigation, 
  supportNavigation, 
  accountNavigation 
} from './sidebar/navigationConfig';
import { useRole } from '@/hooks/useRoleContext';
import { filterNavItemsByRole } from '@/utils/roleUtils';

interface AppSidebarProps {
  closeSidebar?: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ closeSidebar }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { userRole } = useRole();

  // Filter navigation items based on user role
  const filteredManagementNav = filterNavItemsByRole(managementNavigation, userRole);
  const filteredOperationsNav = filterNavItemsByRole(operationsNavigation, userRole);
  const filteredSupportNav = filterNavItemsByRole(supportNavigation, userRole);

  // Determine which section should be open by default based on current path
  const isDashboardActive = location.pathname.startsWith('/dashboard') || location.pathname === '/';
  const isManagementActive = filteredManagementNav.some(item => 
    location.pathname.startsWith(item.href)
  );
  const isOperationsActive = filteredOperationsNav.some(item => 
    location.pathname.startsWith(item.href)
  );
  const isAccountActive = accountNavigation.some(item => 
    location.pathname.startsWith(item.href)
  );
  const isSupportActive = filteredSupportNav.some(item => 
    location.pathname.startsWith(item.href)
  );

  return (
    <Sidebar className={cn(isMobile && 'hidden md:flex')}>
      <div className="border-r h-screen">
        <SidebarHeader className="h-14 flex items-center px-4">
          <span className="font-semibold">FleetTrack Pro</span>
        </SidebarHeader>
        <SidebarContent className="flex flex-col h-[calc(100vh-3.5rem)]">
          <ScrollArea className="flex-1">
            <div className="px-2 py-2">
              <SidebarNavGroup 
                title="Dashboard" 
                items={dashboardNavigation} 
                currentPath={location.pathname} 
                defaultOpen={isDashboardActive}
              />
              
              {filteredManagementNav.length > 0 && (
                <SidebarNavGroup 
                  title="Management" 
                  items={filteredManagementNav} 
                  currentPath={location.pathname} 
                  defaultOpen={isManagementActive}
                />
              )}
              
              {filteredOperationsNav.length > 0 && (
                <SidebarNavGroup 
                  title="Operations" 
                  items={filteredOperationsNav} 
                  currentPath={location.pathname} 
                  defaultOpen={isOperationsActive}
                />
              )}
              
              <SidebarNavGroup 
                title="Account" 
                items={accountNavigation} 
                currentPath={location.pathname} 
                defaultOpen={isAccountActive}
              />

              <SidebarNavGroup 
                title="Support" 
                items={filteredSupportNav} 
                currentPath={location.pathname} 
                defaultOpen={isSupportActive}
              />
            </div>
          </ScrollArea>
          <SidebarFooterContent />
        </SidebarContent>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
