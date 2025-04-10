
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLogger } from '@/middleware/auditLogger';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenantContext';
import { useNavigate } from 'react-router-dom';

interface UsePaymentProcessorProps {
  amount: number;
  selectedTier?: string;
  paymentMethod: 'stripe' | 'paypal';
  paymentType: string;
  onSuccess?: (paymentIntent: any) => void;
  onError?: (error: Error) => void;
}

export const usePaymentProcessor = ({
  amount,
  selectedTier,
  paymentMethod,
  paymentType,
  onSuccess,
  onError
}: UsePaymentProcessorProps) => {
  const { toast } = useToast();
  const { logEvent } = useAuditLogger();
  const { currentTenant, setCurrentTenant } = useTenant();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Mock successful payment without using Stripe
      console.log(`Processing mock ${paymentMethod} payment for $${(amount / 100).toFixed(2)} with tier ${selectedTier || 'unknown'}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create a fake payment intent for the UI
      const mockPaymentIntent = {
        id: `mock_payment_${Date.now()}`,
        amount: amount,
        status: 'succeeded',
        created: Date.now() / 1000,
        tier: selectedTier,
        paymentMethod
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
        description: `Your ${selectedTier} subscription has been activated using ${paymentMethod === 'stripe' ? 'credit card' : 'PayPal'}.`,
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
          tier: selectedTier,
          paymentMethod
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
          paymentMethod
        },
      });
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,
    processPayment
  };
};
