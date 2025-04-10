
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLogger } from '@/middleware/auditLogger';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenantContext';
import { useNavigate } from 'react-router-dom';
import { useUserMigration } from '@/hooks/subscription/useUserMigration';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { useAuth } from '@/hooks/useAuthContext';

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
  const { migrateToNewTenant } = useUserMigration();
  const { user, refreshSession } = useAuth();
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

        // If this tenant was just created for subscription purposes, ensure the user is migrated to it
        const needsMigration = user?.user_metadata?.needs_subscription === true;
        if (needsMigration) {
          logAuth('PAYMENT', 'User needs migration after subscription', {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });

          // Create a new tenant with the subscription tier
          const tenantName = `${user.email?.split('@')[0]}'s Organization` || 'New Organization';
          
          try {
            // Migrate the user to this tenant
            const migrationResult = await migrateToNewTenant(tenantName);
            
            if (migrationResult.success) {
              logAuth('PAYMENT', `Migration successful: ${JSON.stringify(migrationResult)}`, {
                level: AUTH_LOG_LEVELS.INFO,
                force: true
              });
              
              // Refresh session to ensure user has the new tenant ID
              await refreshSession();

              // Don't navigate yet - we'll do that after all processing is complete
              toast({
                title: "Account Setup Complete",
                description: "Your account has been set up with your new subscription!"
              });
            } else {
              logAuth('PAYMENT', `Migration failed: ${migrationResult.message}`, {
                level: AUTH_LOG_LEVELS.ERROR,
                force: true
              });
              
              toast({
                title: "Subscription Activated",
                description: "Your subscription has been activated, but account setup needs attention.",
                variant: "destructive"
              });
            }
          } catch (migrationError) {
            logAuth('PAYMENT', 'Migration error:', {
              level: AUTH_LOG_LEVELS.ERROR,
              data: migrationError,
              force: true
            });
          }
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
