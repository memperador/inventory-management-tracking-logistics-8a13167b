
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
          currentTimestamp: new Date().toISOString(),
          currentPath: window.location.pathname
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
      
      logAuth('PAYMENT_PROCESS', 'Created mock payment intent', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: mockPaymentIntent
      });
      
      // Check if user needs migration after subscription
      const needsMigration = user?.user_metadata?.needs_subscription === true;
      
      if (needsMigration) {
        logAuth('PAYMENT_MIGRATION', 'User needs migration after subscription', {
          level: AUTH_LOG_LEVELS.INFO,
          force: true,
          data: {
            userId: user?.id,
            email: user?.email,
            userMetadata: user?.user_metadata
          }
        });

        try {
          // Create tenant name based on email or company info
          const emailPrefix = user?.email?.split('@')[0] || '';
          const companyName = user?.user_metadata?.company_name;
          const tenantName = companyName || `${emailPrefix}'s Organization`;
          
          logAuth('PAYMENT_MIGRATION', `Creating tenant with name: ${tenantName}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          // Use type assertion to handle RPC function call
          const { data, error } = await supabase.rpc(
            'create_tenant_and_migrate_user' as any,
            { p_tenant_name: tenantName, p_user_id: user.id }
          );
          
          if (error) {
            logAuth('PAYMENT_MIGRATION', `RPC error during tenant creation: ${error.message}`, {
              level: AUTH_LOG_LEVELS.ERROR,
              force: true,
              data: error
            });
            throw new Error(`Failed to create tenant: ${error.message}`);
          }
          
          // Use type assertion for response data
          const responseData = data as any;
          if (!responseData || responseData.success !== true) {
            logAuth('PAYMENT_MIGRATION', 'Invalid response from create_tenant_and_migrate_user', {
              level: AUTH_LOG_LEVELS.ERROR,
              force: true,
              data: { responseData }
            });
            throw new Error("No tenant ID returned from function");
          }
          
          const newTenantId = responseData.tenant_id as string;
          
          logAuth('PAYMENT_MIGRATION', `Created tenant with ID: ${newTenantId}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          // Update tenant with subscription info
          if (selectedTier) {
            logAuth('PAYMENT_MIGRATION', `Updating new tenant ${newTenantId} with subscription info`, {
              level: AUTH_LOG_LEVELS.INFO,
              force: true,
              data: { selectedTier }
            });
            
            const { error: updateError } = await supabase
              .from('tenants')
              .update({
                subscription_tier: selectedTier,
                subscription_status: 'active',
                trial_ends_at: null
              })
              .eq('id', newTenantId);
              
            if (updateError) {
              logAuth('PAYMENT_MIGRATION', `Error updating subscription info: ${updateError.message}`, {
                level: AUTH_LOG_LEVELS.WARN,
                force: true,
                data: updateError
              });
              console.warn("Error updating subscription info:", updateError.message);
            }
          }
          
          // Clear the needs_subscription flag
          logAuth('PAYMENT_MIGRATION', 'Clearing needs_subscription flag', {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          await supabase.auth.updateUser({
            data: { 
              needs_subscription: false,
              tenant_id: newTenantId
            }
          });
          
          // Refresh session
          logAuth('PAYMENT_MIGRATION', 'Refreshing session after tenant creation', {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          await refreshSession();
          
        } catch (directError) {
          // Fallback to the migration approach
          logAuth('PAYMENT_MIGRATION', `Direct RPC failed, falling back to migration: ${directError instanceof Error ? directError.message : String(directError)}`, {
            level: AUTH_LOG_LEVELS.WARN,
            force: true,
            data: { error: directError }
          });
          
          // Log session state before migration
          logMigrationSessionState(await supabase.auth.getSession().then(res => res.data.session), 
            'Session state before migration');
            
          // Create tenant name
          const emailPrefix = user.email?.split('@')[0] || '';
          const companyName = user.user_metadata?.company_name;
          const tenantName = companyName || `${emailPrefix}'s Organization`;
          
          logAuth('PAYMENT_MIGRATION', `Attempting migration to new tenant: ${tenantName}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          // Migrate user to new tenant
          const migrationResult = await migrateToNewTenant(tenantName);
          
          if (migrationResult.success && migrationResult.newTenantId) {
            logAuth('PAYMENT_MIGRATION', `Migration successful: ${JSON.stringify(migrationResult)}`, {
              level: AUTH_LOG_LEVELS.INFO,
              force: true,
              data: migrationResult
            });
            
            // Update tenant with subscription info
            if (selectedTier) {
              logAuth('PAYMENT_MIGRATION', `Updating tenant after migration: ${migrationResult.newTenantId}`, {
                level: AUTH_LOG_LEVELS.INFO,
                force: true,
                data: { selectedTier }
              });
              
              const { error: updateError } = await supabase
                .from('tenants')
                .update({
                  subscription_tier: selectedTier,
                  subscription_status: 'active',
                  trial_ends_at: null
                })
                .eq('id', migrationResult.newTenantId);
                
              if (updateError) {
                logAuth('PAYMENT_MIGRATION', `Error updating subscription info after migration: ${updateError.message}`, {
                  level: AUTH_LOG_LEVELS.WARN,
                  force: true,
                  data: updateError
                });
                console.warn("Error updating subscription info:", updateError.message);
              }
            }
            
            // Clear the needs_subscription flag
            await supabase.auth.updateUser({
              data: { needs_subscription: false }
            });
            
            // Refresh session
            await refreshSession();
          } else {
            logAuth('PAYMENT_MIGRATION', `Migration failed: ${migrationResult.message}`, {
              level: AUTH_LOG_LEVELS.ERROR,
              force: true,
              data: migrationResult
            });
            throw new Error(`Migration failed: ${migrationResult.message}`);
          }
        }
      } else if (currentTenant?.id && selectedTier) {
        // Update existing tenant subscription info
        logAuth('PAYMENT_PROCESS', `Updating existing tenant ${currentTenant.id} with subscription info`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true,
          data: { 
            tenantId: currentTenant.id,
            selectedTier
          }
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
          logAuth('PAYMENT_PROCESS', `Failed to update subscription: ${updateError.message}`, {
            level: AUTH_LOG_LEVELS.ERROR,
            force: true,
            data: updateError
          });
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }
        
        // Update tenant state
        setCurrentTenant({
          ...currentTenant,
          subscription_tier: selectedTier as any,
          subscription_status: 'active',
          trial_ends_at: null
        });
        
        logAuth('PAYMENT_PROCESS', 'Updated local tenant state with subscription info', {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
      } else {
        logAuth('PAYMENT_PROCESS', 'No tenant info available for update', {
          level: AUTH_LOG_LEVELS.WARN,
          force: true,
          data: { 
            currentTenantId: currentTenant?.id,
            needsMigration,
            userMetadata: user?.user_metadata 
          }
        });
      }
      
      // Log success
      logAuth('PAYMENT_SUCCESS', `Payment successful for ${selectedTier} tier`, {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: { mockPaymentIntent }
      });
      
      toast({
        title: "Payment Successful",
        description: `Your ${selectedTier} subscription has been activated.`,
      });
      
      // Log event
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
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(mockPaymentIntent);
      }

      // Redirect to customer onboarding
      logAuth('PAYMENT_SUCCESS', 'Redirecting to customer onboarding', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: { currentPath: window.location.pathname }
      });
      
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
