
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';

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
          <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
            <span className={`text-sm font-medium ${paymentType === 'subscription' ? 'text-primary' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            
            <Switch 
              checked={paymentType === 'annual'}
              onCheckedChange={(checked) => setPaymentType(checked ? 'annual' : 'subscription')}
              className="mx-4"
            />
            
            <div className="flex items-center">
              <span className={`text-sm font-medium ${paymentType === 'annual' ? 'text-primary' : 'text-muted-foreground'}`}>
                Annual
              </span>
              {paymentType === 'annual' && (
                <span className="text-emerald-600 text-xs ml-2 px-1.5 py-0.5 bg-emerald-50 rounded">10% off</span>
              )}
            </div>
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
      </CardContent>
    </Card>
  );
};

export default PaymentOptions;
