
import React from 'react';
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

export interface NavItem {
  name?: string;
  title?: string;
  href: string;
  icon: string | React.ElementType;
  roles?: UserRole[];
  requiredRoles?: UserRole[];
}

interface SidebarNavGroupProps {
  label: string;
  items: NavItem[];
  showSeparator?: boolean;
  closeSidebar?: () => void;
}

export const SidebarNavGroup = ({ label, items, showSeparator = false, closeSidebar }: SidebarNavGroupProps) => {
  const { hasPermission } = useRole();
  
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
  
  return (
    <>
      {showSeparator && <SidebarSeparator />}
      <SidebarGroup>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
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
      </SidebarGroup>
    </>
  );
};
