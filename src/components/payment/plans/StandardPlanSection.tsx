
import React from 'react';
import PricingTiers from './PricingTiers';
import PaymentOptions from './PaymentOptions';
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
  // Calculate the correct amount based on payment type
  const amount = paymentType === 'annual' 
    ? Math.round(selectedTierData.price * 12 * 0.9) 
    : selectedTierData.price;
    
  return (
    <>
      <PricingTiers 
        tiers={serviceTiers} 
        selectedTier={selectedTier}
        onTierChange={handleTierChange}
        paymentType={paymentType}
        onPaymentTypeChange={handlePaymentTypeChange}
      />
      
      <div className="mt-8 max-w-md mx-auto">
        <PaymentOptions
          agreeToFees={agreeToFees}
          setAgreeToFees={setAgreeToFees}
          currentTier={currentTenantTier}
          isUpgrade={isUpgrade}
          amount={amount}
          paymentType={paymentType}
          selectedTier={selectedTierData.id}
          onSuccess={handleSuccess}
          onError={handleError}
          selectedTierData={selectedTierData}
        />
      </div>
    </>
  );
};

export default StandardPlanSection;
