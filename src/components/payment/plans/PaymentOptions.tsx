
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StripeProvider } from '@/components/payment/StripeProvider';
import PaymentForm from '@/components/payment/PaymentForm';
import { ServiceTier } from './PricingTiers';

interface PaymentOptionsProps {
  agreeToFees: boolean;
  setAgreeToFees: (checked: boolean) => void;
  currentTier?: string;
  isUpgrade?: boolean;
  amount: number;
  paymentType: string;
  selectedTier: string;
  selectedTierData: ServiceTier;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: Error) => void;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  agreeToFees,
  setAgreeToFees,
  currentTier,
  isUpgrade,
  amount,
  paymentType,
  selectedTier,
  selectedTierData,
  onSuccess,
  onError
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Options</CardTitle>
        <CardDescription>Configure your payment details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isUpgrade && currentTier && (
          <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded border border-amber-200">
            <p className="text-sm">
              <strong>Upgrading from {currentTier}:</strong> You'll be charged a prorated 
              amount for the remainder of the current billing cycle.
            </p>
          </div>
        )}

        <div className="mb-6 border-b pb-4">
          <h3 className="font-medium mb-2">Plan Summary</h3>
          <div className="text-sm">
            <p><strong>Selected Plan:</strong> {selectedTierData.name}</p>
            
            <div className="mt-2">
              <p><strong>Features:</strong></p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {selectedTierData.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-2">
              <p><strong>Limits:</strong></p>
              <ul className="pl-5 mt-1">
                <li>Assets: {selectedTierData.limits.assets}</li>
                <li>Users: {selectedTierData.limits.users}</li>
              </ul>
            </div>
            
            {selectedTierData.ai && (
              <div className="mt-2">
                <p><strong>AI Assistant:</strong> {selectedTierData.ai}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-top space-x-2 pt-4">
          <Checkbox 
            id="agree-fees" 
            checked={agreeToFees}
            onCheckedChange={(checked) => setAgreeToFees(checked === true)}
          />
          <Label htmlFor="agree-fees" className="text-sm text-muted-foreground">
            I understand that payment processing fees for credit cards (Visa, Mastercard, Discover, American Express) 
            will be added to my bill. These fees are typically 2.9% + $0.30 per transaction.
          </Label>
        </div>
        
        <div className="mt-6">
          <ErrorBoundary>
            <StripeProvider>
              <PaymentForm 
                amount={amount}
                disabled={!agreeToFees}
                paymentType={paymentType}
                onSuccess={onSuccess}
                onError={onError}
                selectedTier={selectedTier}
              />
            </StripeProvider>
          </ErrorBoundary>
        </div>
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

export default PaymentOptions;
