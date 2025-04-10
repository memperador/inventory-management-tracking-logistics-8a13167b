
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

export const useSubscriptionPayment = () => {
  const { currentTenant, setCurrentTenant } = useTenant();
  const { user, refreshSession } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Payment success handler
  const handleSuccess = async (paymentIntent: any) => {
    console.log('Payment succeeded:', paymentIntent);
    
    toast({
      title: `Subscription Updated`,
      description: `Your subscription has been successfully updated.`,
    });
    
    // Refresh the session to make sure we have updated user data
    try {
      await refreshSession();
      logAuth('SUBSCRIPTION', 'Session refreshed after subscription update', {
        level: AUTH_LOG_LEVELS.INFO
      });
    } catch (error) {
      logAuth('SUBSCRIPTION', 'Failed to refresh session:', {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
    }
    
    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  // Payment error handler
  const handleError = (error: Error) => {
    console.error('Payment failed:', error);
    toast({
      title: "Payment Failed",
      description: error.message,
      variant: "destructive",
    });
  };

  // Subscription update handler
  const updateSubscription = async (tier: string) => {
    if (!currentTenant?.id) return;
    
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          // Clear trial end date if it was on a trial
          trial_ends_at: null
        })
        .eq('id', currentTenant.id);
        
      if (error) throw error;
      
      // Update the local tenant state
      setCurrentTenant({
        ...currentTenant,
        subscription_tier: tier as any,
        subscription_status: 'active',
        trial_ends_at: null
      });
      
      // Refresh user session to ensure tenant changes are propagated
      await refreshSession();
      
      toast({
        title: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan Activated`,
        description: tier === 'enterprise' 
          ? "Enterprise plan has been activated. Our team will contact you shortly."
          : `Your ${tier} plan has been activated.`
      });
      
      // Navigate to dashboard if not enterprise
      if (tier !== 'enterprise') {
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };
  
  return {
    handleSuccess,
    handleError,
    updateSubscription
  };
};
