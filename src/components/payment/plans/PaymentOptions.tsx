
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
          <Label>Payment Period</Label>
          <ToggleGroup 
            type="single" 
            value={paymentType} 
            onValueChange={(value) => {
              if (value) setPaymentType(value);
            }}
            className="flex justify-start bg-slate-100 p-1 rounded-lg"
          >
            <ToggleGroupItem value="subscription" className="flex-1 data-[state=on]:bg-white data-[state=on]:shadow-sm">
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem value="annual" className="flex-1 data-[state=on]:bg-white data-[state=on]:shadow-sm">
              Annual <span className="text-emerald-600 text-xs ml-1">10% off</span>
            </ToggleGroupItem>
          </ToggleGroup>
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
