
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import React, { useEffect, useState } from 'react';

// Replace this with your actual publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51O6Om3STrC6uP5IOaqSCFKQzR7YTKFMUZvnzBSBNF3KoqnkPaaGsXgeN6PZX9wyYomuuioPLI9vTJsoIotQogRHL00wmXdJuE0';

interface StripeProviderProps {
  children: React.ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    if (!stripePromise) {
      setStripePromise(loadStripe(STRIPE_PUBLISHABLE_KEY));
    }
  }, [stripePromise]);

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};
