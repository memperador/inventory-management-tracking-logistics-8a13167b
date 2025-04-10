
import React from 'react';
import serviceTiers from '@/utils/subscription/serviceTiers';
import { ServiceTier } from '@/components/payment/plans/PricingTiers';

export const useSubscriptionPlanSelector = () => {
  const [selectedTier, setSelectedTier] = React.useState('standard');
  const [paymentAmount, setPaymentAmount] = React.useState(9900); // Default to Standard tier
  const [paymentType, setPaymentType] = React.useState('subscription');
  const [agreeToFees, setAgreeToFees] = React.useState(false);

  const handleTierChange = (tierId: string) => {
    setSelectedTier(tierId);
    updatePaymentAmount(tierId, paymentType);
  };

  const handlePaymentTypeChange = (type: string) => {
    setPaymentType(type);
    updatePaymentAmount(selectedTier, type);
  };
  
  const updatePaymentAmount = (tier: string, payType: string) => {
    const tierData = serviceTiers.find(t => t.id === tier);
    if (tierData) {
      if (payType === 'annual') {
        // Apply 10% discount for annual payments
        setPaymentAmount(Math.round(tierData.price * 12 * 0.9));
      } else {
        setPaymentAmount(tierData.price);
      }
    }
  };
  
  const selectedTierData = serviceTiers.find(tier => tier.id === selectedTier) || serviceTiers[1]; // Default to Standard

  return {
    selectedTier,
    selectedTierData,
    paymentType,
    paymentAmount,
    agreeToFees,
    handleTierChange,
    handlePaymentTypeChange,
    setAgreeToFees,
    serviceTiers
  };
};
