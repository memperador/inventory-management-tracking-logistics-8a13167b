
import React from 'react';
import { CardElement } from '@stripe/react-stripe-js';

interface StripePaymentMethodProps {
  cardElementOptions: any;
}

export const StripePaymentMethod: React.FC<StripePaymentMethodProps> = ({ cardElementOptions }) => {
  return (
    <div className="rounded-md border p-4">
      <CardElement options={cardElementOptions} />
    </div>
  );
};
