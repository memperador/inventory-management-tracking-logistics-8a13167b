
import React from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { useTenant } from '@/hooks/useTenantContext';
import { useSubscriptionPlanSelector } from './useSubscriptionPlanSelector';
import { useSubscriptionPayment } from './useSubscriptionPayment';
import { useEnterpriseInquiry } from './useEnterpriseInquiry';
import { useSubscriptionTrial } from './useSubscriptionTrial';

export const useSubscriptionPlans = () => {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  
  const {
    selectedTier,
    selectedTierData,
    paymentType,
    paymentAmount,
    agreeToFees,
    handleTierChange,
    handlePaymentTypeChange,
    setAgreeToFees,
    serviceTiers
  } = useSubscriptionPlanSelector();
  
  const {
    handleSuccess,
    handleError,
    updateSubscription
  } = useSubscriptionPayment();
  
  const { handleEnterpriseInquiry } = useEnterpriseInquiry(updateSubscription);
  
  const { handleStartTrial } = useSubscriptionTrial();

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

export default useSubscriptionPlans;
