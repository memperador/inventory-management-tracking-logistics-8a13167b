
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLogger } from '@/middleware/auditLogger';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenantContext';
import { useNavigate } from 'react-router-dom';
import { useUserMigration } from '@/hooks/subscription/useUserMigration';
import { logAuth, AUTH_LOG_LEVELS, dumpAuthLogs } from '@/utils/debug/authLogger';
import { useAuth } from '@/hooks/useAuthContext';
import { logMigrationSessionState } from '@/utils/subscription/userMigrationUtils';

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
      // Log payment process start
      logAuth('PAYMENT_PROCESS', `Starting ${paymentMethod} payment process for ${selectedTier} tier`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: { 
          amount, 
          paymentType, 
          userId: user?.id,
          email: user?.email,
          currentTimestamp: new Date().toISOString()
        }
      });
      
      // Log current session state before payment
      logMigrationSessionState(await supabase.auth.getSession().then(res => res.data.session), 
        'Session state before payment processing');
      
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
      
      // Update existing tenant if already created
      if (selectedTier && currentTenant?.id) {
        logAuth('PAYMENT', `Updating existing tenant ${currentTenant.id} with subscription tier ${selectedTier}`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
        
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

        // Check if user needs migration after subscription
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

          // Create tenant name based on email or company info
          const emailPrefix = user.email?.split('@')[0] || '';
          const companyName = user.user_metadata?.company_name;
          const tenantName = companyName || `${emailPrefix}'s Organization`;
          
          try {
            // Log session state before migration
            logMigrationSessionState(await supabase.auth.getSession().then(res => res.data.session), 
              'Session state before migration');
            
            // Migrate user to new tenant and set as admin
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
              
              // Clear the needs_subscription flag
              await supabase.auth.updateUser({
                data: { needs_subscription: false }
              });
              
              // Refresh the session to get the latest metadata and tenant ID
              await refreshSession();
              
              // Log session state after migration
              logMigrationSessionState(await supabase.auth.getSession().then(res => res.data.session), 
                'Session state after migration and refresh');
              
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
              
              // Clear any session storage flags that might cause redirect loops
              sessionStorage.removeItem('authRedirectHandled');
              sessionStorage.removeItem('processingAuth');
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
            const errorData = migrationError instanceof Error 
              ? { message: migrationError.message, stack: migrationError.stack }
              : { stringError: String(migrationError) };
              
            logAuth('PAYMENT', 'Migration error:', {
              level: AUTH_LOG_LEVELS.ERROR,
              data: errorData,
              force: true
            });
          }
        } else {
          // Just refresh the session to get latest tenant data
          await refreshSession();
        }
      }

      toast({
        title: "Subscription updated",
        description: `Your ${selectedTier} subscription has been activated using ${paymentMethod === 'stripe' ? 'credit card' : 'PayPal'}.`,
      });
      
      await logEvent({
        userId: user?.id || 'unknown-user',
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
      
      // Redirect to onboarding after successful payment
      if (onSuccess) {
        onSuccess(mockPaymentIntent);
      }

      // Redirect to customer onboarding instead of dashboard
      navigate('/customer-onboarding');
      
    } catch (err) {
      const errorData = err instanceof Error 
        ? { message: err.message, stack: err.stack }
        : { stringError: String(err) };
        
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      
      logAuth('PAYMENT_ERROR', 'Payment process failed:', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: errorData,
        force: true
      });
      
      toast({
        title: "Payment failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      await logEvent({
        userId: user?.id || 'unknown-user',
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
