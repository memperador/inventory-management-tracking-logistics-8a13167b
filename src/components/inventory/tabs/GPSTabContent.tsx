
import React from 'react';
import GPSIntegration from '@/pages/GPSIntegration';
import { useTenant } from '@/hooks/useTenantContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const GPSTabContent: React.FC = () => {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if the user has access to GPS tracking (Standard tier or above)
  const hasGPSTracking = currentTenant?.subscription_tier === 'standard' || 
                         currentTenant?.subscription_tier === 'premium';
  
  // A simplified version of GPS tracking for inventory
  if (hasGPSTracking) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Equipment Location Tracking</h2>
          <Button
            variant="outline"
            onClick={() => navigate('/gps')}
          >
            Advanced GPS Features
          </Button>
        </div>
        <p className="text-muted-foreground">
          Track the current location of your equipment inventory. For advanced GPS features including 
          geofencing and route optimization, visit the GPS Integration page.
        </p>
        <GPSIntegration simplified={true} />
      </div>
    );
  }
  
  // Upgrade prompt for users without GPS tracking access
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="text-center space-y-4 max-w-md">
        <h3 className="text-xl font-medium">GPS Tracking Available in Standard Plan</h3>
        <p className="text-muted-foreground">
          Upgrade to our Standard or Premium plan to access equipment location tracking, 
          real-time updates, and more advanced GPS features.
        </p>
        <Button 
          onClick={() => {
            toast({
              title: "Subscription Upgrade",
              description: "Redirecting to upgrade options...",
            });
            navigate('/payment');
          }}
        >
          Upgrade Subscription
        </Button>
      </div>
    </div>
  );
};
