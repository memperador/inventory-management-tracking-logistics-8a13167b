
import React from 'react';
import GPSIntegration from '@/pages/GPSIntegration';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { FeatureGate } from '@/components/subscription/FeatureGate';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

export const GPSTabContent: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasSubscriptionTier } = useFeatureAccess();
  
  // Using the new feature gate system
  return (
    <FeatureGate
      featureKey="gps_tracking"
      fallback={
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
      }
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Equipment Location Tracking</h2>
          
          {/* Advanced GPS features are only available on Premium tier */}
          <FeatureGate
            featureKey="advanced_gps"
            showUpgradePrompt={false}
            fallback={
              <Button
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Premium Feature",
                    description: "Advanced GPS features are available in Premium tier. Redirecting to upgrade options.",
                  });
                  navigate('/payment');
                }}
              >
                Advanced GPS Features
              </Button>
            }
          >
            <Button
              variant="outline"
              onClick={() => navigate('/gps')}
            >
              Advanced GPS Features
            </Button>
          </FeatureGate>
        </div>
        <p className="text-muted-foreground">
          Track the current location of your equipment inventory. For advanced GPS features including 
          geofencing and route optimization, visit the GPS Integration page.
        </p>
        <GPSIntegration simplified={true} />
      </div>
    </FeatureGate>
  );
};
