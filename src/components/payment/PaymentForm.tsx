
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuditLogger } from '@/middleware/auditLogger';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenantContext';
import { useNavigate } from 'react-router-dom';

interface PaymentFormProps {
  amount: number;
  selectedTier?: string;
  disabled?: boolean;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: Error) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  amount, 
  selectedTier,
  disabled = false,
  onSuccess, 
  onError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const { logEvent } = useAuditLogger();
  const { currentTenant, setCurrentTenant } = useTenant();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mock successful payment without using Stripe
      console.log(`Processing mock payment for $${(amount / 100).toFixed(2)} with tier ${selectedTier || 'unknown'}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a fake payment intent for the UI
      const mockPaymentIntent = {
        id: `mock_payment_${Date.now()}`,
        amount: amount,
        status: 'succeeded',
        created: Date.now() / 1000,
        tier: selectedTier
      };
      
      // Update the tenant's subscription in Supabase
      if (selectedTier && currentTenant?.id) {
        const { error: updateError } = await supabase
          .from('tenants')
          .update({
            subscription_tier: selectedTier,
            subscription_status: 'active',
            // Clear trial end date if it was on a trial
            trial_ends_at: null
          })
          .eq('id', currentTenant.id);
        
        if (updateError) {
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }
        
        // Update the local tenant state
        if (currentTenant) {
          setCurrentTenant({
            ...currentTenant,
            subscription_tier: selectedTier as any,
            subscription_status: 'active',
            trial_ends_at: null
          });
        }
      }

      toast({
        title: "Subscription updated",
        description: `Your ${selectedTier} subscription has been activated.`,
      });
      
      // Log the successful mock payment
      await logEvent({
        userId: 'current-user',
        action: 'mock_payment_processed',
        entityType: 'payment',
        entityId: mockPaymentIntent.id,
        newValue: {
          amount,
          status: mockPaymentIntent.status,
          id: mockPaymentIntent.id,
          tier: selectedTier
        },
      });
      
      if (onSuccess) {
        onSuccess(mockPaymentIntent);
      }

      // Redirect to dashboard
      navigate('/dashboard');
      
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
        userId: 'current-user',
        action: 'mock_payment_failed',
        entityType: 'payment',
        entityId: 'attempt',
        metadata: {
          amount,
          tier: selectedTier,
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
        <div className="mt-2 text-sm text-blue-600">
          This is a mock payment system - no actual charges will be processed
        </div>
      </div>
      
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      
      <Button 
        type="submit" 
        disabled={loading || disabled} 
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Mock Subscribe: $${(amount / 100).toFixed(2)}`
        )}
      </Button>
      
      {disabled && (
        <p className="text-sm text-destructive text-center">
          Please agree to the payment processing terms to continue
        </p>
      )}
    </form>
  );
};

export default PaymentForm;
