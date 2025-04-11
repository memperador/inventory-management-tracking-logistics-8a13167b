
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenantContext';
import { addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { logMigrationSessionState } from '@/utils/subscription/userMigrationUtils';
import { useUserMigration } from '@/hooks/subscription/useUserMigration';

export const useSubscriptionTrial = () => {
  const { currentTenant, setCurrentTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, refreshSession, user } = useAuth();
  const { migrateToNewTenant } = useUserMigration();
  const [isStartingTrial, setIsStartingTrial] = React.useState(false);

  // Trial handler
  const handleStartTrial = async () => {
    if (isStartingTrial) return;
    setIsStartingTrial(true);
    
    try {
      logAuth('TRIAL', 'Starting free trial process', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: {
          userId: session?.user?.id,
          currentTenant: currentTenant?.id || 'none',
          email: user?.email,
          timestamp: new Date().toISOString(),
          userMetadata: user?.user_metadata
        }
      });

      // Log session state before changes
      logMigrationSessionState(session, 'Session state before starting trial');
      
      // Calculate trial end date - 7 days from now
      const trialEndsAt = addDays(new Date(), 7).toISOString();
      
      // Check if user needs migration (is new user)
      const needsMigration = user?.user_metadata?.needs_subscription === true;
      
      if (needsMigration) {
        logAuth('TRIAL', 'New user needs migration for trial setup', {
          level: AUTH_LOG_LEVELS.INFO, 
          force: true,
          data: { 
            email: user?.email,
            userMetadata: user?.user_metadata,
            currentPath: window.location.pathname
          }
        });
        
        try {
          // Create tenant name based on email or company info
          const emailPrefix = user?.email?.split('@')[0] || '';
          const companyName = user?.user_metadata?.company_name || `${emailPrefix}'s Organization`;
          
          logAuth('TRIAL', `Creating tenant with name: ${companyName}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          // Direct tenant creation for more reliability in trial flow
          const { data, error } = await supabase.rpc(
            'create_tenant_and_migrate_user' as any,
            { p_tenant_name: companyName, p_user_id: user.id }
          );
          
          if (error) {
            logAuth('TRIAL', `RPC error during tenant creation: ${error.message}`, {
              level: AUTH_LOG_LEVELS.ERROR,
              force: true,
              data: error
            });
            throw new Error(`Failed to create tenant: ${error.message}`);
          }
          
          // Type assertion for response data
          const responseData = data as any;
          if (!responseData || responseData.success !== true) {
            logAuth('TRIAL', 'Invalid response from create_tenant_and_migrate_user', {
              level: AUTH_LOG_LEVELS.ERROR,
              force: true,
              data: { responseData }
            });
            throw new Error('Failed to create tenant: No response from server');
          }
          
          const newTenantId = responseData.tenant_id as string;
          
          logAuth('TRIAL', `Created tenant with ID: ${newTenantId}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true,
            data: { tenantId: newTenantId }
          });
          
          // Update the tenant with trial info
          const { error: updateError } = await supabase
            .from('tenants')
            .update({
              subscription_tier: 'premium',
              subscription_status: 'trialing',
              trial_ends_at: trialEndsAt
            })
            .eq('id', newTenantId);
            
          if (updateError) {
            logAuth('TRIAL', `Error updating tenant with trial info: ${updateError.message}`, {
              level: AUTH_LOG_LEVELS.WARN,
              force: true,
              data: updateError
            });
          }
          
          // Clear subscription flag
          logAuth('TRIAL', 'Clearing subscription flag and setting tenant ID', {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          await supabase.auth.updateUser({
            data: { 
              needs_subscription: false,
              tenant_id: newTenantId
            }
          });
          
          // Refresh session to get updated info
          logAuth('TRIAL', 'Refreshing session after tenant creation', {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          await refreshSession();
          
        } catch (error) {
          logAuth('TRIAL', `Failed to create tenant directly: ${error instanceof Error ? error.message : String(error)}`, {
            level: AUTH_LOG_LEVELS.ERROR,
            force: true,
            data: error
          });
          
          // Fall back to tenant migration
          // Extract email prefix here so it's defined in this scope
          const userEmailPrefix = user?.email?.split('@')[0] || '';

          logAuth('TRIAL', 'Falling back to tenant migration', {
            level: AUTH_LOG_LEVELS.INFO,
            force: true,
            data: { emailPrefix: userEmailPrefix }
          });
          
          const migrationResult = await migrateToNewTenant(`${userEmailPrefix || 'New'}'s Organization`);
          
          logAuth('TRIAL', `Migration result: ${migrationResult.success ? 'Success' : 'Failed'}`, {
            level: migrationResult.success ? AUTH_LOG_LEVELS.INFO : AUTH_LOG_LEVELS.ERROR,
            force: true,
            data: migrationResult
          });
          
          if (!migrationResult.success) {
            throw new Error(`Failed to create tenant: ${migrationResult.message}`);
          }
          
          // Update the tenant with trial info
          if (migrationResult.newTenantId) {
            const { error: updateError } = await supabase
              .from('tenants')
              .update({
                subscription_tier: 'premium',
                subscription_status: 'trialing',
                trial_ends_at: trialEndsAt
              })
              .eq('id', migrationResult.newTenantId);
              
            if (updateError) {
              logAuth('TRIAL', `Error updating migrated tenant with trial info: ${updateError.message}`, {
                level: AUTH_LOG_LEVELS.WARN,
                force: true,
                data: updateError
              });
            }
          }
        }
      } else if (currentTenant?.id) {
        // Update existing tenant with trial info
        logAuth('TRIAL', `Updating existing tenant ${currentTenant.id} with trial info`, {
          level: AUTH_LOG_LEVELS.INFO,
          force: true,
          data: { 
            tenantId: currentTenant.id,
            trialEndsAt 
          }
        });
        
        const { error } = await supabase
          .from('tenants')
          .update({
            subscription_tier: 'premium',
            subscription_status: 'trialing',
            trial_ends_at: trialEndsAt
          })
          .eq('id', currentTenant.id);
          
        if (error) {
          logAuth('TRIAL', `Failed to update tenant with trial info: ${error.message}`, {
            level: AUTH_LOG_LEVELS.ERROR,
            force: true,
            data: error
          });
          throw error;
        }
        
        // Update the local tenant state
        setCurrentTenant({
          ...currentTenant,
          subscription_tier: 'premium',
          subscription_status: 'trialing',
          trial_ends_at: trialEndsAt
        });

        logAuth('TRIAL', 'Updated local tenant state with trial info', {
          level: AUTH_LOG_LEVELS.INFO,
          force: true
        });
      } else {
        logAuth('TRIAL', 'No tenant found and user is not new - cannot start trial', {
          level: AUTH_LOG_LEVELS.ERROR,
          force: true,
          data: { currentTenant, userMetadata: user?.user_metadata }
        });
        throw new Error('No tenant found and user is not new - cannot start trial');
      }
      
      // Refresh session to ensure latest tenant data
      logAuth('TRIAL', 'Refreshing session after starting trial', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true
      });
      
      await refreshSession();
      
      // Log session state after changes
      logMigrationSessionState(session, 'Session state after starting trial');
      
      toast({
        title: "Free Trial Started",
        description: "Your 7-day Premium tier trial has begun. Enjoy all Premium features!",
      });
      
      // Navigate to customer onboarding with a slight delay to ensure UI updates first
      logAuth('TRIAL', 'Redirecting to customer onboarding', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: { currentPath: window.location.pathname }
      });
      
      // Force redirect with a slight delay to ensure all state updates complete
      setTimeout(() => {
        window.location.href = '/customer-onboarding';
      }, 500);
    } catch (error) {
      // Fix for TypeScript error - ensure data is always a Record<string, any>
      const errorData: Record<string, any> = error instanceof Error 
        ? { message: error.message, stack: error.stack }
        : { stringError: String(error) };
      
      logAuth('TRIAL_ERROR', 'Failed to start trial', {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true,
        data: errorData
      });
      
      toast({
        title: "Error",
        description: `Failed to start trial: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsStartingTrial(false);
    }
  };

  return {
    handleStartTrial,
    isStartingTrial
  };
};

