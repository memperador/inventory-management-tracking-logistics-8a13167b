
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Layers, 
  Package, 
  Users, 
  Map, 
  BarChart2, 
  Settings, 
  LogOut,
  Bell,
  Calendar,
  HardDrive,
  Truck,
  LifeBuoy,
  Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';

export function AppSidebar() {
  const location = useLocation();
  
  const mainNavigation = [
    { name: 'Dashboard', href: '/', icon: Layers },
    { name: 'Equipment', href: '/equipment', icon: Package },
    { name: 'Projects', href: '/projects', icon: Map },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
  ];

  const integrationNavigation = [
    { name: 'GPS Integration', href: '/gps-integration', icon: HardDrive },
    { name: 'Scheduling', href: '/scheduling', icon: Calendar },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench },
    { name: 'Fleet', href: '/fleet', icon: Truck },
  ];
  
  const settingsNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Help & Support', href: '/support', icon: LifeBuoy },
  ];
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center h-16 px-6">
          <Link to="/" className="flex items-center">
            <span className="font-bold text-xl text-inventory-blue">FleetTrack</span>
          </Link>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    tooltip={item.name}
                    isActive={location.pathname === item.href}
                    asChild
                  >
                    <Link to={item.href}>
                      <item.icon className={cn(
                        "mr-3 h-5 w-5", 
                        location.pathname === item.href ? "text-inventory-blue" : "text-gray-400"
                      )} />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>Integrations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {integrationNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    tooltip={item.name}
                    isActive={location.pathname === item.href}
                    asChild
                  >
                    <Link to={item.href}>
                      <item.icon className={cn(
                        "mr-3 h-5 w-5", 
                        location.pathname === item.href ? "text-inventory-blue" : "text-gray-400"
                      )} />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton 
                    tooltip={item.name}
                    isActive={location.pathname === item.href}
                    asChild
                  >
                    <Link to={item.href}>
                      <item.icon className={cn(
                        "mr-3 h-5 w-5", 
                        location.pathname === item.href ? "text-inventory-blue" : "text-gray-400"
                      )} />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-600 hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
