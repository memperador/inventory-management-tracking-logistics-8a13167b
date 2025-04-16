
import React from 'react';
import { useSubscriptionStatus } from '@/hooks/subscription/useSubscriptionStatus';

const AccountTab: React.FC = () => {
  const { currentTier, isTrialMode, trialDaysLeft } = useSubscriptionStatus();

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Account Information</h2>
      <p className="text-muted-foreground mb-6">
        View and manage your account details and subscription information.
      </p>
      
      <div className="border rounded-md p-6 mb-6 bg-card">
        <h3 className="text-lg font-medium mb-3">Current Subscription</h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Status:</span>
          <span className={`py-1 px-3 rounded-full text-sm ${isTrialMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {isTrialMode ? 'Trial' : 'Active'}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Plan:</span>
          <span className="font-semibold capitalize">{currentTier || 'No plan'}</span>
        </div>
        
        {isTrialMode && trialDaysLeft > 0 && (
          <div className="flex items-center justify-between">
            <span className="font-medium">Trial ends in:</span>
            <span className="font-semibold">{trialDaysLeft} days</span>
          </div>
        )}
      </div>
      
      <div className="border rounded-md p-6 bg-card">
        <h3 className="text-lg font-medium mb-3">Account Details</h3>
        
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">Email: </span>
            <span className="text-muted-foreground">user@example.com</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">Member since: </span>
            <span className="text-muted-foreground">April 2025</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;
