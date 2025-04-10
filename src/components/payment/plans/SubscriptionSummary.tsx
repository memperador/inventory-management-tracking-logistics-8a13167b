
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StripeProvider } from '@/components/payment/StripeProvider';
import PaymentForm from '@/components/payment/PaymentForm';
import { ServiceTier } from './PricingTiers';
import { PlanHeader } from './summary/PlanHeader';
import { UpgradeNotice } from './summary/UpgradeNotice';
import { PlanFooter } from './summary/PlanFooter';

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
  agreeToFees,
  isUpgrade,
  currentTier,
  onSuccess,
  onError
}) => {
  // Calculate the correct amount based on payment type
  const amount = paymentType === 'annual' 
    ? Math.round(selectedTierData.price * 12 * 0.9) 
    : selectedTierData.price;

  const title = isUpgrade 
    ? 'Upgrade to ' + selectedTierData.name 
    : 'Subscribe to ' + selectedTierData.name;

  return (
    <Card>
      <PlanHeader 
        title={title} 
        isAnnual={paymentType === 'annual'} 
      />
      
      <CardContent>
        {isUpgrade && <UpgradeNotice currentTier={currentTier} />}
        
        <ErrorBoundary>
          <StripeProvider>
            <PaymentForm 
              amount={amount}
              disabled={!agreeToFees}
              paymentType={paymentType}
              onSuccess={onSuccess}
              onError={onError}
              selectedTier={selectedTierData.id}
            />
          </StripeProvider>
        </ErrorBoundary>
      </CardContent>
      
      <PlanFooter />
    </Card>
  );
};

export default SubscriptionSummary;
