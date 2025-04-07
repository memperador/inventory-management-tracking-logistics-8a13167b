import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarNavItemProps {
  name: string;
  href: string;
  icon: React.ElementType;
  closeSidebar?: () => void;
}

export const SidebarNavItem = ({ name, href, icon: Icon, closeSidebar }: SidebarNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={name}
      >
        <Link
          to={href}
          onClick={() => closeSidebar && closeSidebar()}
        >
          <Icon />
          <span>{name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
