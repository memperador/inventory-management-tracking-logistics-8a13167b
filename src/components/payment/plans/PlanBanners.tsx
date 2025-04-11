
import React from 'react';
import FreeTrialBanner from './FreeTrialBanner';

interface PlanBannersProps {
  isNewSignup: boolean;
  onStartTrial: () => void;
  isStartingTrial?: boolean;
}

export const PlanBanners: React.FC<PlanBannersProps> = ({ 
  isNewSignup, 
  onStartTrial,
  isStartingTrial = false
}) => {
  if (isNewSignup) {
    return <FreeTrialBanner onStartTrial={onStartTrial} isStartingTrial={isStartingTrial} />;
  }
  
  return null;
};

export default PlanBanners;
