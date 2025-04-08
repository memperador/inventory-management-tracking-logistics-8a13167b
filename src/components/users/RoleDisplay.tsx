
import React, { useState } from 'react';
import { UserRole } from '@/types/roles';
import { useRole } from '@/hooks/useRoleContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Permission from '../auth/Permission';
import RoleBadge from './RoleBadge';
import RoleDropdown from './RoleDropdown';

interface RoleDisplayProps {
  userId: string;
  initialRole: UserRole;
}

const RoleDisplay: React.FC<RoleDisplayProps> = ({ userId, initialRole }) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const { isAdmin } = useRole();
  const queryClient = useQueryClient();
  
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
        fallback={<RoleBadge role={role} />}
      >
        <RoleDropdown 
          currentRole={role} 
          onRoleChange={handleRoleChange} 
        />
      </Permission>
    </div>
  );
};

export default RoleDisplay;
