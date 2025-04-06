
import React from 'react';
import { Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types/roles';
import { getRoleBadgeColor } from '@/utils/roleUtils';

interface RoleBadgeProps {
  role: UserRole;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  return (
    <Badge 
      variant="outline" 
      className={`${getRoleBadgeColor(role)} capitalize`}
    >
      {role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
      {role}
    </Badge>
  );
};

export default RoleBadge;
