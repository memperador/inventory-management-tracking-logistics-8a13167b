
import React, { useState } from 'react';
import { Check, ChevronDown, Shield } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/roles';
import { useRole } from '@/hooks/useRoleContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Permission from '../auth/Permission';

interface RoleDisplayProps {
  userId: string;
  initialRole: UserRole;
}

const RoleDisplay: React.FC<RoleDisplayProps> = ({ userId, initialRole }) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const { isAdmin } = useRole();
  const queryClient = useQueryClient();
  
  const roles: UserRole[] = ['admin', 'manager', 'operator', 'viewer'];
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-inventory-blue-light text-inventory-blue border-inventory-blue';
      case 'manager':
        return 'bg-inventory-green-light text-inventory-green border-inventory-green';
      case 'operator':
        return 'bg-inventory-yellow-light text-inventory-yellow border-inventory-yellow';
      case 'viewer':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return '';
    }
  };

  const updateRoleMutation = useMutation({
    mutationFn: async (newRole: UserRole) => {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      return newRole;
    },
    onSuccess: (newRole) => {
      setRole(newRole);
      toast({
        title: 'Role updated',
        description: `User role updated to ${newRole}`,
      });
      // Invalidate users query to refresh list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update role: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole !== role) {
      updateRoleMutation.mutate(newRole);
    }
  };

  return (
    <div>
      <Permission 
        allowedRoles={['admin']}
        fallback={
          <Badge 
            variant="outline" 
            className={`${getRoleBadgeColor(role)} capitalize`}
          >
            {role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
            {role}
          </Badge>
        }
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className={`${getRoleBadgeColor(role)} border px-3 py-1 h-7`}
            >
              {role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
              <span className="capitalize">{role}</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {roles.map((roleOption) => (
              <DropdownMenuItem 
                key={roleOption}
                onClick={() => handleRoleChange(roleOption)}
                className="flex items-center justify-between"
              >
                <span className="capitalize">{roleOption}</span>
                {role === roleOption && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Permission>
    </div>
  );
};

export default RoleDisplay;
