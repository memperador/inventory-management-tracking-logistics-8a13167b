
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
  Wrench,
  FileText,
  DollarSign,
  ShoppingCart,
  Book,
  MessageSquare,
  CreditCard,
  GitBranch
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
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import Permission from '@/components/auth/Permission';

export function AppSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const { userRole, hasPermission } = useRole();
  
  const mainNavigation = [
    { name: 'Dashboard', href: '/', icon: Layers, roles: ['viewer', 'operator', 'manager', 'admin'] },
    { name: 'Equipment', href: '/equipment', icon: Package, roles: ['viewer', 'operator', 'manager', 'admin'] },
    { name: 'Projects', href: '/projects', icon: Map, roles: ['viewer', 'operator', 'manager', 'admin'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
    { name: 'Analytics', href: '/analytics', icon: BarChart2, roles: ['manager', 'admin'] },
    { name: 'Reports', href: '/reports', icon: FileText, roles: ['manager', 'admin'] },
  ];

  const integrationNavigation = [
    { name: 'GPS Integration', href: '/gps-integration', icon: HardDrive, roles: ['operator', 'manager', 'admin'] },
    { name: 'Scheduling', href: '/scheduling', icon: Calendar, roles: ['operator', 'manager', 'admin'] },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['operator', 'manager', 'admin'] },
    { name: 'Fleet', href: '/fleet', icon: Truck, roles: ['operator', 'manager', 'admin'] },
    { name: 'Inventory', href: '/inventory', icon: ShoppingCart, roles: ['operator', 'manager', 'admin'] },
    { name: 'Payment', href: '/payments', icon: CreditCard, roles: ['viewer', 'operator', 'manager', 'admin'] },
    { name: 'Workflow', href: '/workflow', icon: GitBranch, roles: ['operator', 'manager', 'admin'] },
  ];
  
  const settingsNavigation = [
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['viewer', 'operator', 'manager', 'admin'] },
    { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['viewer', 'operator', 'manager', 'admin'] },
    { name: 'Documentation', href: '/documentation', icon: Book, roles: ['viewer', 'operator', 'manager', 'admin'] },
    { name: 'Support', href: '/support', icon: LifeBuoy, roles: ['viewer', 'operator', 'manager', 'admin'] },
    { name: 'Billing', href: '/billing', icon: DollarSign, roles: ['manager', 'admin'] },
    { name: 'Chat', href: '/chat', icon: MessageSquare, roles: ['viewer', 'operator', 'manager', 'admin'] },
  ];

  // Filter menu items based on user role
  const filterMenuItems = (items) => {
    return items.filter(item => hasPermission(item.roles));
  };
  
  const filteredMainNavigation = filterMenuItems(mainNavigation);
  const filteredIntegrationNavigation = filterMenuItems(integrationNavigation);
  const filteredSettingsNavigation = filterMenuItems(settingsNavigation);

  // Only show sections if they have items
  const showMainSection = filteredMainNavigation.length > 0;
  const showIntegrationSection = filteredIntegrationNavigation.length > 0;
  const showSettingsSection = filteredSettingsNavigation.length > 0;
  
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
        {showMainSection && (
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMainNavigation.map((item) => (
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
        )}
        
        {showMainSection && showIntegrationSection && <SidebarSeparator />}
        
        {showIntegrationSection && (
          <SidebarGroup>
            <SidebarGroupLabel>Integrations</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredIntegrationNavigation.map((item) => (
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
        )}
        
        {(showMainSection || showIntegrationSection) && showSettingsSection && <SidebarSeparator />}
        
        {showSettingsSection && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSettingsNavigation.map((item) => (
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
        )}
      </SidebarContent>
      
      <SidebarFooter className="mt-auto hidden md:block">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-3 py-2">
              <div className="mb-2 rounded-md bg-gray-50 px-3 py-2">
                <p className="text-xs font-medium text-gray-500">LOGGED IN AS</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User'}</p>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-600 hover:bg-gray-100"
              onClick={() => signOut()}
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
