
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
