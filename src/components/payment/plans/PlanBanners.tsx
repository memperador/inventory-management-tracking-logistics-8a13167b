
import React from 'react';
import FreeTrialBanner from './FreeTrialBanner';
import SignupWelcomeBanner from './SignupWelcomeBanner';

interface PlanBannersProps {
  isNewSignup: boolean;
  onStartTrial: () => void;
}

const PlanBanners: React.FC<PlanBannersProps> = ({ isNewSignup, onStartTrial }) => {
  return (
    <>
      {isNewSignup && <SignupWelcomeBanner />}
      <FreeTrialBanner onStartTrial={onStartTrial} />
    </>
  );
};

export default PlanBanners;
