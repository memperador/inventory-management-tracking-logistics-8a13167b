
import { useContext } from 'react';
import { TenantContext } from '@/contexts/TenantContext';

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return {
    ...context,
    setCurrentTenant: (tenant) => {
      if (context.currentTenant !== tenant) {
        // Update the context with the new tenant
        (context as any).setCurrentTenant(tenant);
      }
    }
  };
};

// For backward compatibility
export const useTenantContext = useTenant;
