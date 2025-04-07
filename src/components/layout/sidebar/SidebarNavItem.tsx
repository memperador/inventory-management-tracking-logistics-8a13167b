
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SidebarNavItemProps {
  name: string;
  href: string;
  icon: React.ElementType;
  active?: boolean;
}

export const SidebarNavItem = ({ name, href, icon: Icon, active }: SidebarNavItemProps) => {
  const location = useLocation();
  const isActive = active !== undefined ? active : location.pathname === href;

  return (
    <SidebarMenuItem key={name}>
      <SidebarMenuButton 
        tooltip={name}
        isActive={isActive}
        asChild
      >
        <Link to={href}>
          <Icon className={cn(
            "mr-3 h-5 w-5", 
            isActive ? "text-inventory-blue" : "text-gray-400"
          )} />
          <span>{name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
