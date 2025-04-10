
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

  // Trial handler
  const handleStartTrial = async () => {
    if (!currentTenant?.id) {
      toast({
        title: "Error",
        description: "Unable to start trial - no tenant information found",
        variant: "destructive"
      });
      return;
    }
    
    try {
      logAuth('TRIAL', 'Starting free trial process', {
        level: AUTH_LOG_LEVELS.INFO,
        force: true,
        data: {
          tenantId: currentTenant.id,
          userId: session?.user?.id,
          currentState: currentTenant.subscription_status
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
        
        // Create tenant name based on email or company info
        const emailPrefix = user?.email?.split('@')[0] || '';
        const companyName = user?.user_metadata?.company_name;
        const tenantName = companyName || `${emailPrefix}'s Organization`;
        
        // Migrate user to new tenant with trial
        const migrationResult = await migrateToNewTenant(tenantName);
        
        if (migrationResult.success && migrationResult.newTenantId) {
          // Update the new tenant with trial info
          const { error } = await supabase
            .from('tenants')
            .update({
              subscription_tier: 'premium',
              subscription_status: 'trialing',
              trial_ends_at: trialEndsAt
            })
            .eq('id', migrationResult.newTenantId);
            
          if (error) throw error;
          
          // Clear subscription flag
          await supabase.auth.updateUser({
            data: { needs_subscription: false }
          });
          
          // Refresh session to get updated info
          await refreshSession();
          
          // Log success
          logAuth('TRIAL', 'Successfully created new tenant with trial', {
            level: AUTH_LOG_LEVELS.INFO,
            force: true,
            data: { 
              newTenantId: migrationResult.newTenantId,
              trialEndsAt
            }
          });
        } else {
          throw new Error(`Failed to create new tenant: ${migrationResult.message}`);
        }
      } else {
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
    }
  };

  return {
    handleStartTrial
  };
};
