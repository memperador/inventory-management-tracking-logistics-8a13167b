
import React from 'react';
import { useSubscriptionPlans } from '@/hooks/subscription/useSubscriptionPlans';
import EnterprisePlanSection from './EnterprisePlanSection';
import StandardPlanSection from './StandardPlanSection';
import PlanBanners from './PlanBanners';

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
    handleStartTrial,
    isStartingTrial
  } = useSubscriptionPlans();
  
  // Display banners
  const renderBanners = () => (
    <PlanBanners 
      isNewSignup={isNewSignup}
      onStartTrial={handleStartTrial}
      isStartingTrial={isStartingTrial}
    />
  );

  // If enterprise tier is selected, show enterprise contact form
  if (selectedTier === 'enterprise') {
    return (
      <>
        {renderBanners()}
        <EnterprisePlanSection 
          serviceTiers={serviceTiers}
          selectedTier={selectedTier}
          handleTierChange={handleTierChange}
          paymentType={paymentType}
          handlePaymentTypeChange={handlePaymentTypeChange}
          handleEnterpriseInquiry={handleEnterpriseInquiry}
        />
      </>
    );
  }

  return (
    <>
      {renderBanners()}
      <StandardPlanSection 
        serviceTiers={serviceTiers}
        selectedTier={selectedTier}
        selectedTierData={selectedTierData}
        paymentType={paymentType}
        agreeToFees={agreeToFees}
        isUpgrade={isUpgrade}
        currentTenantTier={currentTenant?.subscription_tier}
        handleTierChange={handleTierChange}
        handlePaymentTypeChange={handlePaymentTypeChange}
        setAgreeToFees={setAgreeToFees}
        handleSuccess={handleSuccess}
        handleError={handleError}
      />
    </>
  );
};

export default PlansTab;
