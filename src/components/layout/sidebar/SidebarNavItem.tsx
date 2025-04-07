
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import * as LucideIcons from 'lucide-react';

interface SidebarNavItemProps {
  name?: string;     // Support both name and title
  title?: string;    // Support both name and title
  href: string;
  icon: string | React.ElementType;
  closeSidebar?: () => void;
}

export const SidebarNavItem = ({ name, title, href, icon, closeSidebar }: SidebarNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === href || 
                   (href === '/' && location.pathname === '/') || 
                   (href !== '/' && location.pathname.startsWith(`${href}`));
  
  // Use either name or title, with title taking precedence
  const displayName = title || name || '';
  
  let IconComponent: React.ElementType;
  
  // Handle both string icon names and direct component references
  if (typeof icon === 'string') {
    // Try to get the icon from Lucide
    IconComponent = (LucideIcons as any)[icon] || LucideIcons.HelpCircle;
  } else {
    IconComponent = icon;
  }

  const handleClick = (e: React.MouseEvent) => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={displayName}
      >
        <Link
          to={href}
          onClick={handleClick}
        >
          <IconComponent />
          <span>{displayName}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
