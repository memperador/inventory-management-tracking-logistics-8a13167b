
import { useContext } from 'react';
import { RoleContext } from '@/contexts/RoleContext';

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// For backward compatibility
export const useRoleContext = useRole;

// Default export for backward compatibility
export default useRole;
