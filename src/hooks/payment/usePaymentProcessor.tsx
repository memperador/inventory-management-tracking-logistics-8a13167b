import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLogger } from '@/middleware/auditLogger';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenantContext';
import { useNavigate } from 'react-router-dom';
import { useUserMigration } from '@/hooks/subscription/useUserMigration';
import { logAuth, AUTH_LOG_LEVELS, dumpAuthLogs } from '@/utils/debug/authLogger';
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
      logAuth('PAYMENT_PROCESS', `Starting ${paymentMethod} payment process for ${selectedTier} tier`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: { amount, paymentType, userId: user?.id }
      });
      
      console.log(`Processing mock ${paymentMethod} payment for $${(amount / 100).toFixed(2)} with tier ${selectedTier || 'unknown'}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockPaymentIntent = {
        id: `mock_payment_${Date.now()}`,
        amount: amount,
        status: 'succeeded',
        created: Date.now() / 1000,
        tier: selectedTier,
        paymentMethod
      };
      
      if (selectedTier && currentTenant?.id) {
        const { error: updateError } = await supabase
          .from('tenants')
          .update({
            subscription_tier: selectedTier,
            subscription_status: 'active',
            trial_ends_at: null
          })
          .eq('id', currentTenant.id);
        
        if (updateError) {
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }
        
        if (currentTenant) {
          setCurrentTenant({
            ...currentTenant,
            subscription_tier: selectedTier as any,
            subscription_status: 'active',
            trial_ends_at: null
          });
        }

        const needsMigration = user?.user_metadata?.needs_subscription === true;
        if (needsMigration) {
          logAuth('PAYMENT', 'User needs migration after subscription', {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });

          logAuth('PAYMENT_MIGRATION', 'Attempting to migrate user to new tenant', {
            level: AUTH_LOG_LEVELS.INFO,
            force: true,
            data: {
              userId: user?.id,
              email: user?.email,
              subscriptionTier: selectedTier,
              paymentMethod,
              currentTimestamp: new Date().toISOString()
            }
          });

          const tenantName = `${user.email?.split('@')[0]}'s Organization` || 'New Organization';
          
          try {
            const migrationResult = await migrateToNewTenant(tenantName);
            
            if (migrationResult.success) {
              logAuth('PAYMENT', `Migration successful: ${JSON.stringify(migrationResult)}`, {
                level: AUTH_LOG_LEVELS.INFO,
                force: true
              });
              
              const logs = dumpAuthLogs();
              logAuth('PAYMENT_DEBUG', `Auth logs prior to session refresh: ${logs.length} entries`, {
                level: AUTH_LOG_LEVELS.DEBUG,
                force: true
              });
              
              logAuth('PAYMENT_SESSION', 'Refreshing user session after migration', {
                level: AUTH_LOG_LEVELS.INFO,
                force: true
              });
              
              await refreshSession();
              
              logAuth('PAYMENT_SESSION', 'Session refresh complete', {
                level: AUTH_LOG_LEVELS.INFO,
                force: true,
                data: {
                  newTenantId: migrationResult.newTenantId,
                  userHasTenant: !!user?.user_metadata?.tenant_id
                }
              });

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

      navigate('/dashboard');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Payment failed",
        description: errorMessage,
        variant: "destructive",
      });
      
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
