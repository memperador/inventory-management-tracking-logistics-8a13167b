
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentUserContextProps {
  currentUserData: any;
  currentUserTenant: any;
}

const CurrentUserContext: React.FC<CurrentUserContextProps> = ({ 
  currentUserData, 
  currentUserTenant 
}) => {
  if (!currentUserData || !currentUserTenant) return null;
  
  return (
    <Card>
      <CardHeader className="bg-blue-50 border-b pb-3">
        <CardTitle className="text-md">Current User Context</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm mb-2">User Details</h4>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">User ID:</span> {currentUserData.id}</div>
              <div><span className="font-medium">Role:</span> {currentUserData.role}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Tenant Details</h4>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Tenant:</span> {currentUserTenant.name}</div>
              <div><span className="font-medium">Subscription:</span> {currentUserTenant.subscription_tier} ({currentUserTenant.subscription_status})</div>
              <div>
                <span className="font-medium">Trial:</span>
                {currentUserTenant.trial_ends_at ? (
                  <span> Ends {new Date(currentUserTenant.trial_ends_at).toLocaleDateString()}</span>
                ) : (
                  <span> No active trial</span>
                )}
              </div>
              <div>
                <span className="font-medium">Onboarding completed:</span>
                <span> {currentUserTenant.onboarding_completed ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentUserContext;
