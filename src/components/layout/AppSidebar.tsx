
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { SidebarNavGroup } from './sidebar/SidebarNavGroup';
import { SidebarFooterContent } from './sidebar/SidebarFooterContent';
import { 
  mainNavigation, 
  integrationNavigation, 
  settingsNavigation 
} from './sidebar/navigationConfig';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center h-16 px-6">
          <Link to="/" className="flex items-center">
            <span className="font-bold text-xl text-inventory-blue">FleetTrack</span>
          </Link>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="pb-12 md:pb-0">
        <SidebarNavGroup 
          label="Main" 
          items={mainNavigation} 
        />
        
        <SidebarNavGroup 
          label="Integrations" 
          items={integrationNavigation} 
          showSeparator={true}
        />
        
        <SidebarNavGroup 
          label="Administration" 
          items={settingsNavigation} 
          showSeparator={true}
        />
      </SidebarContent>
      
      <SidebarFooter className="mt-auto hidden md:block">
        <SidebarFooterContent />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
