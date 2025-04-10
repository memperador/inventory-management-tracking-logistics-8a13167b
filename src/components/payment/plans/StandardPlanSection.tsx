
import React from 'react';
import PricingTiers from './PricingTiers';
import PaymentOptions from './PaymentOptions';
import SubscriptionSummary from './SubscriptionSummary';
import { ServiceTier } from './PricingTiers';

interface StandardPlanSectionProps {
  serviceTiers: ServiceTier[];
  selectedTier: string;
  selectedTierData: ServiceTier;
  paymentType: string;
  agreeToFees: boolean;
  isUpgrade: boolean;
  currentTenantTier?: string;
  handleTierChange: (tierId: string) => void;
  handlePaymentTypeChange: (type: string) => void;
  setAgreeToFees: (value: boolean) => void;
  handleSuccess: (paymentIntent: any) => void;
  handleError: (error: Error) => void;
}

const StandardPlanSection: React.FC<StandardPlanSectionProps> = ({
  serviceTiers,
  selectedTier,
  selectedTierData,
  paymentType,
  agreeToFees,
  isUpgrade,
  currentTenantTier,
  handleTierChange,
  handlePaymentTypeChange,
  setAgreeToFees,
  handleSuccess,
  handleError
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
      
      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <PaymentOptions
          agreeToFees={agreeToFees}
          setAgreeToFees={setAgreeToFees}
          currentTier={currentTenantTier}
          isUpgrade={isUpgrade}
        />
        
        <SubscriptionSummary
          selectedTierData={selectedTierData}
          paymentType={paymentType}
          agreeToFees={agreeToFees}
          isUpgrade={isUpgrade}
          currentTier={currentTenantTier}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </>
  );
};

export default StandardPlanSection;
