
import React from 'react';
import { useTenant } from '@/hooks/useTenantContext';
import { useAuth } from '@/hooks/useAuthContext';
import { useToast } from '@/hooks/use-toast';
import serviceTiers from '@/utils/subscription/serviceTiers';
import { useNavigate } from 'react-router-dom';
import { addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { ServiceTier } from '@/components/payment/plans/PricingTiers';

export const useSubscriptionPlans = () => {
  const [selectedTier, setSelectedTier] = React.useState('standard');
  const [paymentAmount, setPaymentAmount] = React.useState(9900); // Default to Standard tier
  const [paymentType, setPaymentType] = React.useState('subscription');
  const [agreeToFees, setAgreeToFees] = React.useState(false);
  const { currentTenant, setCurrentTenant } = useTenant();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTierChange = (tierId: string) => {
    setSelectedTier(tierId);
    const tier = serviceTiers.find(t => t.id === tierId);
    if (tier) {
      if (paymentType === 'annual') {
        setPaymentAmount(Math.round(tier.price * 12 * 0.9));
      } else {
        setPaymentAmount(tier.price);
      }
    }
  };

  const handlePaymentTypeChange = (type: string) => {
    setPaymentType(type);
    const tier = serviceTiers.find(t => t.id === selectedTier);
    if (tier) {
      if (type === 'annual') {
        setPaymentAmount(Math.round(tier.price * 12 * 0.9));
      } else {
        setPaymentAmount(tier.price);
      }
    }
  };
  
  const selectedTierData = serviceTiers.find(tier => tier.id === selectedTier) || serviceTiers[1]; // Default to Standard

  // Payment success handler
  const handleSuccess = async (paymentIntent: any) => {
    console.log('Payment succeeded:', paymentIntent);
    
    toast({
      title: `Subscribed to ${selectedTierData.name} Plan`,
      description: `You now have access to ${selectedTierData.description} features.`,
    });
    
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

  // Enterprise inquiry handler
  const handleEnterpriseInquiry = () => {
    toast({
      title: "Enterprise Inquiry Sent",
      description: "Our team will contact you shortly to discuss your enterprise needs.",
    });
    
    // For testing purposes, also set the subscription to enterprise
    if (currentTenant?.id) {
      updateSubscription('enterprise');
    }
  };

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
      
      toast({
        title: "Free Trial Started",
        description: "Your 7-day Premium tier trial has begun. Enjoy all Premium features!",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to start trial: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
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

  const isUpgrade = !!currentTenant?.subscription_tier;
  const isNewSignup = user?.user_metadata?.needs_subscription === true;

  return {
    serviceTiers,
    selectedTier,
    selectedTierData,
    paymentType,
    paymentAmount,
    agreeToFees,
    isUpgrade,
    isNewSignup,
    currentTenant,
    handleTierChange,
    handlePaymentTypeChange,
    setAgreeToFees,
    handleSuccess,
    handleError,
    handleEnterpriseInquiry,
    handleStartTrial,
    updateSubscription
  };
};
