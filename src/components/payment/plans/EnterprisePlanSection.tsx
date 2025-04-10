
import React from 'react';
import PricingTiers from './PricingTiers';
import EnterpriseContact from './EnterpriseContact';
import { ServiceTier } from './PricingTiers';

interface EnterprisePlanSectionProps {
  serviceTiers: ServiceTier[];
  selectedTier: string;
  handleTierChange: (tierId: string) => void;
  paymentType: string;
  handlePaymentTypeChange: (type: string) => void;
  handleEnterpriseInquiry: () => void;
}

const EnterprisePlanSection: React.FC<EnterprisePlanSectionProps> = ({
  serviceTiers,
  selectedTier,
  handleTierChange,
  paymentType,
  handlePaymentTypeChange,
  handleEnterpriseInquiry
}) => {
  return (
    <>
      <PricingTiers 
        tiers={serviceTiers} 
        selectedTier={selectedTier}
        onTierChange={handleTierChange}
        paymentType={paymentType}
        onPaymentTypeChange={handlePaymentTypeChange}
      />
      <EnterpriseContact onEnterpriseInquiry={handleEnterpriseInquiry} />
    </>
  );
};

export default EnterprisePlanSection;
