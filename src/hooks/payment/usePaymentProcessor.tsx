
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
      
      // Check if user needs migration after subscription
      const needsMigration = user?.user_metadata?.needs_subscription === true;
      
      if (needsMigration) {
        logAuth('PAYMENT_MIGRATION', 'User needs migration after subscription', {
          level: AUTH_LOG_LEVELS.INFO,
          force: true,
          data: {
            userId: user?.id,
            email: user?.email,
          }
        });

        try {
          // Create tenant name based on email or company info
          const emailPrefix = user?.email?.split('@')[0] || '';
          const companyName = user?.user_metadata?.company_name;
          const tenantName = companyName || `${emailPrefix}'s Organization`;
          
          // Use type assertion to handle RPC function call
          const { data, error } = await supabase.rpc(
            'create_tenant_and_migrate_user' as any,
            { p_tenant_name: tenantName, p_user_id: user.id }
          );
          
          if (error) {
            throw new Error(`Failed to create tenant: ${error.message}`);
          }
          
          // Use type assertion for response data
          const responseData = data as any;
          if (!responseData || responseData.success !== true) {
            throw new Error("No tenant ID returned from function");
          }
          
          const newTenantId = responseData.tenant_id as string;
          
          // Update tenant with subscription info
          if (selectedTier) {
            const { error: updateError } = await supabase
              .from('tenants')
              .update({
                subscription_tier: selectedTier,
                subscription_status: 'active',
                trial_ends_at: null
              })
              .eq('id', newTenantId);
              
            if (updateError) {
              console.warn("Error updating subscription info:", updateError.message);
            }
          }
          
          // Clear the needs_subscription flag
          await supabase.auth.updateUser({
            data: { 
              needs_subscription: false,
              tenant_id: newTenantId
            }
          });
          
          // Refresh session
          await refreshSession();
          
          logAuth('PAYMENT', `Created tenant with direct RPC: ${newTenantId}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
        } catch (directError) {
          // Fallback to the migration approach
          logAuth('PAYMENT', `Direct RPC failed, falling back to migration: ${directError instanceof Error ? directError.message : String(directError)}`, {
            level: AUTH_LOG_LEVELS.WARN,
            force: true
          });
          
          // Log session state before migration
          logMigrationSessionState(await supabase.auth.getSession().then(res => res.data.session), 
            'Session state before migration');
            
          // Create tenant name
          const emailPrefix = user.email?.split('@')[0] || '';
          const companyName = user.user_metadata?.company_name;
          const tenantName = companyName || `${emailPrefix}'s Organization`;
          
          // Migrate user to new tenant
          const migrationResult = await migrateToNewTenant(tenantName);
          
          if (migrationResult.success && migrationResult.newTenantId) {
            // Update tenant with subscription info
            if (selectedTier) {
              const { error: updateError } = await supabase
                .from('tenants')
                .update({
                  subscription_tier: selectedTier,
                  subscription_status: 'active',
                  trial_ends_at: null
                })
                .eq('id', migrationResult.newTenantId);
                
              if (updateError) {
                console.warn("Error updating subscription info:", updateError.message);
              }
            }
            
            // Clear the needs_subscription flag
            await supabase.auth.updateUser({
              data: { needs_subscription: false }
            });
            
            // Refresh session
            await refreshSession();
            
            logAuth('PAYMENT', `Migration successful: ${JSON.stringify(migrationResult)}`, {
              level: AUTH_LOG_LEVELS.INFO,
              force: true
            });
          } else {
            throw new Error(`Migration failed: ${migrationResult.message}`);
          }
        }
      } else if (currentTenant?.id && selectedTier) {
        // Update existing tenant subscription info
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
        
        // Update tenant state
        setCurrentTenant({
          ...currentTenant,
          subscription_tier: selectedTier as any,
          subscription_status: 'active',
          trial_ends_at: null
        });
      }
      
      // Log success
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
