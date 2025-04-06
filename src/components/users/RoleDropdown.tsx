
import React from 'react';
import { Check, ChevronDown, Shield } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types/roles';
import { getAllRoles, getRoleBadgeColor } from '@/utils/roleUtils';

interface RoleDropdownProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const RoleDropdown: React.FC<RoleDropdownProps> = ({ currentRole, onRoleChange }) => {
  const roles = getAllRoles();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`${getRoleBadgeColor(currentRole)} border px-3 py-1 h-7`}
        >
          {currentRole === 'admin' && <Shield className="mr-1 h-3 w-3" />}
          <span className="capitalize">{currentRole}</span>
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {roles.map((roleOption) => (
          <DropdownMenuItem 
            key={roleOption}
            onClick={() => onRoleChange(roleOption)}
            className="flex items-center justify-between"
          >
            <span className="capitalize">{roleOption}</span>
            {currentRole === roleOption && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleDropdown;
