
import React, { useState } from 'react';
import { UserRole } from '@/types/roles';
import { useRole } from '@/hooks/useRoleContext';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { SidebarNavItem } from './SidebarNavItem';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface NavItem {
  name?: string;
  title?: string;
  href: string;
  icon: string | React.ElementType;
  roles?: UserRole[];
  requiredRoles?: UserRole[];
}

interface SidebarNavGroupProps {
  title: string;
  items: NavItem[];
  currentPath: string;
  showSeparator?: boolean;
  closeSidebar?: () => void;
  defaultOpen?: boolean;
}

export const SidebarNavGroup = ({ 
  title, 
  items, 
  currentPath,
  showSeparator = false,
  closeSidebar,
  defaultOpen = true
}: SidebarNavGroupProps) => {
  const { hasPermission } = useRole();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Filter menu items based on user role, supporting both roles and requiredRoles properties
  const filteredItems = items.filter(item => {
    // If roles is defined, use it
    if (item.roles) {
      return hasPermission(item.roles);
    }
    // Otherwise, if requiredRoles is defined, use it
    else if (item.requiredRoles) {
      return hasPermission(item.requiredRoles);
    }
    // If neither is defined, always show the item
    return true;
  });
  
  // Don't render the group if there are no items to show
  if (filteredItems.length === 0) {
    return null;
  }

  // Check if any item in the group is active
  const hasActiveItem = filteredItems.some(item => 
    currentPath === item.href || 
    (currentPath !== '/' && item.href !== '/' && currentPath.startsWith(item.href))
  );
  
  return (
    <>
      {showSeparator && <SidebarSeparator />}
      <SidebarGroup>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <SidebarGroupLabel className="flex justify-between items-center hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer">
              <span>{title}</span>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </SidebarGroupLabel>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredItems.map((item) => (
                  <SidebarNavItem
                    key={item.name || item.title}
                    name={item.name}
                    title={item.title}
                    href={item.href}
                    icon={item.icon}
                    closeSidebar={closeSidebar}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
    </>
  );
};
