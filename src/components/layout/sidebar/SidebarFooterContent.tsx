
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthContext';
import { useRole } from '@/hooks/useRoleContext';
import {
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

export const SidebarFooterContent = () => {
  const { signOut } = useAuth();
  const { userRole } = useRole();
  
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <div className="px-3 py-2">
          <div className="mb-2 rounded-md bg-gray-50 px-3 py-2 dark:bg-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">LOGGED IN AS</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User'}
              </p>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => signOut()}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign out
        </Button>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
