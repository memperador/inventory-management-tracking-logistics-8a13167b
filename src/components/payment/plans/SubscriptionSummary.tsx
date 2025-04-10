
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StripeProvider } from '@/components/payment/StripeProvider';
import PaymentForm from '@/components/payment/PaymentForm';
import { ShieldCheck } from 'lucide-react';
import { ServiceTier } from './PricingTiers';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isUpgrade ? 'Upgrade to ' + selectedTierData.name : 'Subscribe to ' + selectedTierData.name}
        </CardTitle>
        <CardDescription>
          {paymentType === 'subscription' 
            ? 'You will be charged this amount monthly'
            : 'You will be charged annually (10% discount applied)'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isUpgrade && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded border border-amber-200">
            <p className="text-sm">
              <strong>Upgrading from {currentTier}:</strong> You'll be charged a prorated 
              amount for the remainder of the current billing cycle.
            </p>
          </div>
        )}
        
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
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Your payment information is securely processed.</span>
        </div>
        <p>You can upgrade or downgrade your plan at any time.</p>
      </CardFooter>
    </Card>
  );
};

export default SubscriptionSummary;
