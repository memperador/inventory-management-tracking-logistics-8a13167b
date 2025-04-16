
import React from 'react';
import { useTenant } from '@/contexts/TenantContext';

const AccountTab: React.FC = () => {
  const { currentTenant } = useTenant();

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Account Information</h2>
      <p className="text-muted-foreground mb-6">
        View and manage your account settings and subscription details.
      </p>
      
      <div className="border rounded-md p-6 mb-6 bg-card">
        <h3 className="text-lg font-medium mb-3">Organization Details</h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Organization Name</p>
            <p className="font-medium">{currentTenant?.name || 'Not specified'}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Subscription Tier</p>
            <p className="font-medium capitalize">{currentTenant?.subscription_tier || 'Basic'}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Subscription Status</p>
            <p className="font-medium capitalize">{currentTenant?.subscription_status || 'Inactive'}</p>
          </div>
        </div>
      </div>
      
      <div className="border rounded-md p-6 bg-card">
        <h3 className="text-lg font-medium mb-3">Contact Information</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This information will be used for billing and account notifications.
        </p>
        
        <button className="text-sm text-primary hover:underline">
          Update Contact Information
        </button>
      </div>
    </div>
  );
};

export default AccountTab;
