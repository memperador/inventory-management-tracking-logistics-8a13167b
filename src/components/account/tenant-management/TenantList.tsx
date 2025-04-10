
import React from 'react';
import { Tenant } from '@/types/tenant';

interface TenantListProps {
  tenants: Tenant[];
  isLoading: boolean;
  selectedTenantId: string;
  onTenantSelect: (tenantId: string) => void;
}

const TenantList: React.FC<TenantListProps> = ({
  tenants,
  isLoading,
  selectedTenantId,
  onTenantSelect
}) => {
  return (
    <select
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      value={selectedTenantId}
      onChange={(e) => onTenantSelect(e.target.value)}
      disabled={isLoading}
    >
      <option value="">Select a tenant...</option>
      {tenants.map(tenant => (
        <option key={tenant.id} value={tenant.id}>
          {tenant.name} - {tenant.subscription_tier || 'No tier'} ({tenant.subscription_status || 'Unknown status'})
        </option>
      ))}
    </select>
  );
};

export default TenantList;
