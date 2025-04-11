
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
          email: user?.email
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
          data: { email: user?.email }
        });
        
        try {
          // Create tenant name based on email or company info
          const emailPrefix = user?.email?.split('@')[0] || '';
          const companyName = user?.user_metadata?.company_name || `${emailPrefix}'s Organization`;
          
          // Direct tenant creation for more reliability in trial flow
          const { data, error } = await supabase.rpc(
            'create_tenant_and_migrate_user',
            { p_tenant_name: companyName, p_user_id: user.id }
          );
          
          if (error) {
            throw new Error(`Failed to create tenant: ${error.message}`);
          }
          
          if (!data || !data.success) {
            throw new Error('Failed to create tenant: No response from server');
          }
          
          const newTenantId = data.tenant_id;
          
          logAuth('TRIAL', `Created tenant with ID: ${newTenantId}`, {
            level: AUTH_LOG_LEVELS.INFO,
            force: true
          });
          
          // Clear subscription flag
          await supabase.auth.updateUser({
            data: { 
              needs_subscription: false,
              tenant_id: newTenantId
            }
          });
          
          // Refresh session to get updated info
          await refreshSession();
          
        } catch (error) {
          logAuth('TRIAL', `Failed to create tenant directly: ${error instanceof Error ? error.message : String(error)}`, {
            level: AUTH_LOG_LEVELS.ERROR,
            force: true,
            data: error
          });
          
          // Fall back to tenant migration
          const migrationResult = await migrateToNewTenant(`${emailPrefix || 'New'}'s Organization`);
          
          if (!migrationResult.success) {
            throw new Error(`Failed to create tenant: ${migrationResult.message}`);
          }
        }
      } else if (currentTenant?.id) {
        // Update existing tenant with trial info
        const { error } = await supabase
          .from('tenants')
          .update({
            subscription_tier: 'premium',
            subscription_status: 'trialing',
            trial_ends_at: trialEndsAt
          })
          .eq('id', currentTenant.id);
          
        if (error) throw error;
        
        // Update the local tenant state
        setCurrentTenant({
          ...currentTenant,
          subscription_tier: 'premium',
          subscription_status: 'trialing',
          trial_ends_at: trialEndsAt
        });
      } else {
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
      
      // Navigate to customer onboarding instead of dashboard
      navigate('/customer-onboarding');
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
