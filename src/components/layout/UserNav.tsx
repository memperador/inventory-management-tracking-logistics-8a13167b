
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, User, Shield } from 'lucide-react';
import { getUserDisplayName } from '@/contexts/auth/utils/authorizationUtils';

export function UserNav() {
  const { user, signOut, isProcessing } = useAuth();
  const navigate = useNavigate();
  
  // Extract initials from email or name safely
  const getInitials = () => {
    if (!user) return 'U';
    
    const displayName = getUserDisplayName(user);
    
    // Get first letter of each word, max 2 letters
    return displayName
      .split(' ')
      .map(part => part[0]?.toUpperCase() || '')
      .slice(0, 2)
      .join('')
      || user.email?.[0]?.toUpperCase()
      || 'U';
  };

  // Safely handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Error will be handled inside signOut function
      console.error('Error during sign out:', error);
    }
  };

  // Check for admin role
  const isAdmin = user?.user_metadata?.role === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user?.user_metadata?.avatar_url} 
              alt={getUserDisplayName(user)} 
              referrerPolicy="no-referrer"
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none flex items-center gap-1">
              {getUserDisplayName(user)}
              {isAdmin && <Shield className="h-3 w-3 text-primary" />}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate('/account')}>
            <User className="mr-2 h-4 w-4" />
            <span>Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isProcessing?.signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isProcessing?.signOut ? 'Signing out...' : 'Log out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
