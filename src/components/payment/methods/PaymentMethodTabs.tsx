
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StripePaymentMethod } from './StripePaymentMethod';
import { PayPalPaymentMethod } from './PayPalPaymentMethod';
import { CreditCard, Wallet } from 'lucide-react';

interface PaymentMethodTabsProps {
  paymentMethod: 'stripe' | 'paypal';
  onPaymentMethodChange: (value: 'stripe' | 'paypal') => void;
  cardElementOptions: any;
}

export const PaymentMethodTabs: React.FC<PaymentMethodTabsProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  cardElementOptions
}) => {
  return (
    <Tabs value={paymentMethod} onValueChange={(value) => onPaymentMethodChange(value as 'stripe' | 'paypal')}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="stripe" className="flex items-center">
          <CreditCard className="mr-2 h-4 w-4" />
          Credit Card
        </TabsTrigger>
        <TabsTrigger value="paypal" className="flex items-center">
          <Wallet className="mr-2 h-4 w-4" />
          PayPal
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="stripe" className="pt-4">
        <StripePaymentMethod cardElementOptions={cardElementOptions} />
      </TabsContent>
      
      <TabsContent value="paypal" className="pt-4">
        <PayPalPaymentMethod />
      </TabsContent>
    </Tabs>
  );
};
