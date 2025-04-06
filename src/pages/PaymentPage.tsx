
import React, { useState } from 'react';
import { StripeProvider } from '@/components/payment/StripeProvider';
import PaymentForm from '@/components/payment/PaymentForm';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const PaymentPage = () => {
  const [paymentAmount, setPaymentAmount] = useState(9900); // $99.00
  const [paymentType, setPaymentType] = useState('subscription');

  const handleSuccess = (paymentIntent: any) => {
    console.log('Payment succeeded:', paymentIntent);
    // In a real app, you might redirect or update UI
  };

  const handleError = (error: Error) => {
    console.error('Payment failed:', error);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Payment Processing</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Options</CardTitle>
            <CardDescription>Configure your payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Payment Amount ($)</Label>
              <Input
                id="payment-amount"
                type="number"
                min="1"
                step="0.01"
                value={(paymentAmount / 100).toFixed(2)}
                onChange={(e) => setPaymentAmount(Math.round(parseFloat(e.target.value) * 100))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-type">Payment Type</Label>
              <Select
                value={paymentType}
                onValueChange={setPaymentType}
              >
                <SelectTrigger id="payment-type">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time Payment</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {paymentType === 'subscription' ? 'Subscribe' : 'Make Payment'}
            </CardTitle>
            <CardDescription>
              {paymentType === 'subscription' 
                ? 'You will be charged this amount monthly'
                : 'Complete your one-time payment'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ErrorBoundary>
              <StripeProvider>
                <PaymentForm 
                  amount={paymentAmount}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              </StripeProvider>
            </ErrorBoundary>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Your payment information is securely processed by Stripe.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
