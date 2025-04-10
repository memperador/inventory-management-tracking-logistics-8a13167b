
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface PaymentOptionsProps {
  agreeToFees: boolean;
  setAgreeToFees: (checked: boolean) => void;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  agreeToFees,
  setAgreeToFees
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Options</CardTitle>
        <CardDescription>Configure your payment details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
    </Card>
  );
};

export default PaymentOptions;
