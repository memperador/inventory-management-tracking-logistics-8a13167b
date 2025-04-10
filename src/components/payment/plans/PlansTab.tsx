
import React from 'react';
import PricingTiers from './PricingTiers';
import PaymentOptions from './PaymentOptions';
import SubscriptionSummary from './SubscriptionSummary';
import FreeTrialBanner from './FreeTrialBanner';
import EnterpriseContact from './EnterpriseContact';
import SignupWelcomeBanner from './SignupWelcomeBanner';
import { useSubscriptionPlans } from '@/hooks/subscription/useSubscriptionPlans';

export const PlansTab: React.FC = () => {
  const {
    serviceTiers,
    selectedTier,
    selectedTierData,
    paymentType,
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
    handleStartTrial
  } = useSubscriptionPlans();
  
  // If enterprise tier is selected, show enterprise contact form
  if (selectedTier === 'enterprise') {
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
  }

  return (
    <>
      {isNewSignup && <SignupWelcomeBanner />}

      {/* Free Trial Banner */}
      <FreeTrialBanner onStartTrial={handleStartTrial} />

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
        />
        
        <SubscriptionSummary
          selectedTierData={selectedTierData}
          paymentType={paymentType}
          agreeToFees={agreeToFees}
          isUpgrade={isUpgrade}
          currentTier={currentTenant?.subscription_tier}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </>
  );
};

export default PlansTab;
