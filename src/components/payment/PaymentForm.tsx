
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuditLogger } from '@/middleware/auditLogger';

interface PaymentFormProps {
  amount: number;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: Error) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  onError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { logEvent } = useAuditLogger();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call your backend API
      // to create a PaymentIntent and return the client_secret
      const clientSecret = await createPaymentIntent(amount);

      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret, 
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || 'Payment failed');
      }
      
      if (paymentIntent?.status === 'succeeded') {
        toast({
          title: "Payment successful",
          description: `Your payment of $${(amount / 100).toFixed(2)} was processed successfully`,
        });
        
        // Log the successful payment
        await logEvent({
          userId: 'current-user', // In a real app, get from auth context
          action: 'payment_processed',
          entityType: 'payment',
          entityId: paymentIntent.id,
          newValue: {
            amount,
            status: paymentIntent.status,
            id: paymentIntent.id,
          },
        });
        
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Payment failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Log the failed payment
      await logEvent({
        userId: 'current-user', // In a real app, get from auth context
        action: 'payment_failed',
        entityType: 'payment',
        entityId: 'attempt',
        metadata: {
          amount,
          error: errorMessage,
        },
      });
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock function to simulate creating a payment intent
  // In a real app, this would be an API call to your backend
  const createPaymentIntent = async (amount: number): Promise<string> => {
    console.log(`Creating payment intent for $${(amount / 100).toFixed(2)}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Return a fake client secret
    return 'pi_fake_client_secret_for_demo_purposes_only';
  };

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md border p-4">
        <CardElement options={cardElementOptions} />
      </div>
      
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      
      <Button 
        type="submit" 
        disabled={!stripe || loading} 
        className="w-full"
      >
        {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </Button>
    </form>
  );
};

export default PaymentForm;
