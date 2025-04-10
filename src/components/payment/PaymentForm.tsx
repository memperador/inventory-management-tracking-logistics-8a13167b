
import React, { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { usePaymentProcessor } from '@/hooks/payment/usePaymentProcessor';
import { PaymentMethodTabs } from './methods/PaymentMethodTabs';
import { PaymentButton } from './methods/PaymentButton';

interface PaymentFormProps {
  amount: number;
  selectedTier?: string;
  disabled?: boolean;
  paymentType: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: Error) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  selectedTier,
  disabled = false,
  paymentType,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');

  const { loading, error, processPayment } = usePaymentProcessor({
    amount,
    selectedTier,
    paymentMethod,
    paymentType,
    onSuccess,
    onError
  });

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={processPayment} className="space-y-4">
      <PaymentMethodTabs 
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        cardElementOptions={cardElementOptions}
      />

      <div className="mt-2 text-sm text-blue-600">
        This is a mock payment system - no actual charges will be processed
      </div>
      
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      
      <PaymentButton 
        loading={loading}
        disabled={disabled}
        amount={amount}
        paymentType={paymentType}
      />
      
      {disabled && (
        <p className="text-sm text-destructive text-center">
          Please agree to the payment processing terms to continue
        </p>
      )}
    </form>
  );
};

export default PaymentForm;
