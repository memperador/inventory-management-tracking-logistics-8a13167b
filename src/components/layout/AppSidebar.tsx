
import React from 'react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useMobile } from '@/hooks/use-mobile';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import SidebarNavGroup from './sidebar/SidebarNavGroup';
import SidebarFooterContent from './sidebar/SidebarFooterContent';
import { 
  dashboardNavigation, 
  managementNavigation, 
  operationsNavigation, 
  supportNavigation, 
  accountNavigation 
} from './sidebar/navigationConfig';
import useRoleContext from '@/hooks/useRoleContext';
import { filterNavItemsByRole } from '@/utils/roleUtils';

const AppSidebar = () => {
  const location = useLocation();
  const { isMobile } = useMobile();
  const { userRole } = useRoleContext();

  // Filter navigation items based on user role
  const filteredManagementNav = filterNavItemsByRole(managementNavigation, userRole);
  const filteredOperationsNav = filterNavItemsByRole(operationsNavigation, userRole);
  const filteredSupportNav = filterNavItemsByRole(supportNavigation, userRole);

  return (
    <Sidebar asChild className={cn(isMobile && 'hidden md:flex')}>
      <div className="border-r h-screen">
        <SidebarHeader className="h-14 flex items-center px-4">
          <span className="font-semibold">FleetTrack Pro</span>
        </SidebarHeader>
        <SidebarContent className="flex flex-col h-[calc(100vh-3.5rem)]">
          <ScrollArea className="flex-1">
            <div className="px-2 py-2">
              <SidebarNavGroup title="Dashboard" items={dashboardNavigation} currentPath={location.pathname} />
              
              {filteredManagementNav.length > 0 && (
                <SidebarNavGroup title="Management" items={filteredManagementNav} currentPath={location.pathname} />
              )}
              
              {filteredOperationsNav.length > 0 && (
                <SidebarNavGroup title="Operations" items={filteredOperationsNav} currentPath={location.pathname} />
              )}
              
              <SidebarNavGroup title="Account" items={accountNavigation} currentPath={location.pathname} />
              <SidebarNavGroup title="Support" items={filteredSupportNav} currentPath={location.pathname} />
            </div>
          </ScrollArea>
          <SidebarFooterContent />
        </SidebarContent>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
