import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModeToggle } from '@/components/layout/ModeToggle';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, LogOut, Settings, User } from 'lucide-react';
import { EmailVerificationIndicator } from '@/components/layout/EmailVerificationIndicator';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 py-2 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          FleetTrack
        </Button>
        <EmailVerificationIndicator />
      </div>
      
      <div className="flex items-center space-x-4">
        <ModeToggle />
        
        <NotificationBadge onClick={() => setIsNotificationCenterOpen(true)} />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Avatar"} />
                <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/account')}>
              <User className="h-4 w-4 mr-2" />
              <span>My Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <NotificationCenter 
        isOpen={isNotificationCenterOpen} 
        onClose={() => setIsNotificationCenterOpen(false)} 
      />
    </div>
  );
};
