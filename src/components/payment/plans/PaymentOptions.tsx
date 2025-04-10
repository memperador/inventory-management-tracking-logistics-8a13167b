
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck } from 'lucide-react';

interface PaymentOptionsProps {
  agreeToFees: boolean;
  setAgreeToFees: (checked: boolean) => void;
  currentTier?: string;
  isUpgrade?: boolean;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  agreeToFees,
  setAgreeToFees,
  currentTier,
  isUpgrade
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
