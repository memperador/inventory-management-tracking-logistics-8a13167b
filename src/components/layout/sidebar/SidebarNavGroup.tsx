
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
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

interface SidebarNavGroupProps {
  label: string;
  items: NavItem[];
  showSeparator?: boolean;
  closeSidebar?: () => void;
}

export const SidebarNavGroup = ({ label, items, showSeparator = false, closeSidebar }: SidebarNavGroupProps) => {
  const { hasPermission } = useRole();
  
  // Filter menu items based on user role
  const filteredItems = items.filter(item => hasPermission(item.roles));
  
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
                key={item.name}
                name={item.name}
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
