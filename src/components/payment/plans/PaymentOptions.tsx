
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface PaymentOptionsProps {
  paymentType: string;
  setPaymentType: (value: string) => void;
  agreeToFees: boolean;
  setAgreeToFees: (checked: boolean) => void;
}

export const PaymentOptions: React.FC<PaymentOptionsProps> = ({
  paymentType,
  setPaymentType,
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
        <div className="space-y-2">
          <Label htmlFor="payment-type">Payment Period</Label>
          <Select
            value={paymentType}
            onValueChange={setPaymentType}
          >
            <SelectTrigger id="payment-type">
              <SelectValue placeholder="Select payment period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subscription">Monthly Subscription</SelectItem>
              <SelectItem value="annual">Annual (Save 10%)</SelectItem>
            </SelectContent>
          </Select>
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
      </CardContent>
    </Card>
  );
};

export default PaymentOptions;
