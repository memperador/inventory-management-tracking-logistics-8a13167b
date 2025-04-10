
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenantContext';
import { addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';
import { logMigrationSessionState } from '@/utils/subscription/userMigrationUtils';

export const useSubscriptionTrial = () => {
  const { currentTenant, setCurrentTenant } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, refreshSession } = useAuth();

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
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      logAuth('TRIAL_ERROR', 'Failed to start trial', {
        level: AUTH_LOG_LEVELS.ERROR,
        force: true,
        data: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : String(error)
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
