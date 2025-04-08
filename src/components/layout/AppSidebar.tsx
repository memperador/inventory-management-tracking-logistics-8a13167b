
import React from 'react';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarNavGroup } from './sidebar/SidebarNavGroup';
import { SidebarFooterContent } from './sidebar/SidebarFooterContent';
import { 
  mainNavItems, 
  managementNavItems, 
  systemNavItems 
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
  const filteredManagementNav = filterNavItemsByRole(managementNavItems, userRole);
  const filteredSystemNav = filterNavItemsByRole(systemNavItems, userRole);

  // Determine which section should be open by default based on current path
  const isMainActive = mainNavItems.some(item => 
    location.pathname.startsWith(item.href)
  );
  const isManagementActive = filteredManagementNav.some(item => 
    location.pathname.startsWith(item.href)
  );
  const isSystemActive = filteredSystemNav.some(item => 
    location.pathname.startsWith(item.href)
  );

  return (
    <Sidebar className={cn(isMobile && 'hidden md:flex')}>
      <div className="border-r h-screen">
        <SidebarHeader className="h-14 flex items-center px-4">
          <span className="font-semibold">Inventory Track Pro</span>
        </SidebarHeader>
        <SidebarContent className="flex flex-col h-[calc(100vh-3.5rem)]">
          <ScrollArea className="flex-1">
            <div className="px-2 py-2">
              <SidebarNavGroup 
                title="Main" 
                items={mainNavItems} 
                currentPath={location.pathname} 
                defaultOpen={isMainActive}
              />
              
              {filteredManagementNav.length > 0 && (
                <SidebarNavGroup 
                  title="Management" 
                  items={filteredManagementNav} 
                  currentPath={location.pathname} 
                  defaultOpen={isManagementActive}
                />
              )}
              
              {filteredSystemNav.length > 0 && (
                <SidebarNavGroup 
                  title="System" 
                  items={filteredSystemNav} 
                  currentPath={location.pathname} 
                  defaultOpen={isSystemActive}
                />
              )}
            </div>
          </ScrollArea>
          <SidebarFooterContent />
        </SidebarContent>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
