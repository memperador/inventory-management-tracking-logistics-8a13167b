
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceTier } from './PricingTiers';
import { PlanHeader } from './summary/PlanHeader';

interface SubscriptionSummaryProps {
  selectedTierData: ServiceTier;
  paymentType: string;
  agreeToFees: boolean;
  isUpgrade: boolean;
  currentTier?: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: Error) => void;
}

export const SubscriptionSummary: React.FC<SubscriptionSummaryProps> = ({
  selectedTierData,
  paymentType,
  isUpgrade
}) => {
  const title = selectedTierData.name + ' Plan';

  return (
    <Card>
      <PlanHeader 
        title={title} 
        isAnnual={paymentType === 'annual'} 
      />
      
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm">
            <p><strong>Features:</strong></p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {selectedTierData.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          
          <div className="text-sm">
            <p><strong>Limits:</strong></p>
            <ul className="pl-5 mt-2">
              <li>Assets: {selectedTierData.limits.assets}</li>
              <li>Users: {selectedTierData.limits.users}</li>
            </ul>
          </div>
          
          {selectedTierData.ai && (
            <div className="text-sm">
              <p><strong>AI Assistant:</strong> {selectedTierData.ai}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionSummary;
