
import React from 'react';
import { useTenant } from '@/hooks/useTenantContext';
import { differenceInDays } from 'date-fns';
import StandardTrialBanner from './StandardTrialBanner';
import TierTestingBanner from './TierTestingBanner';

interface TrialBannerProps {
  className?: string;
  showTierSwitcher?: boolean;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ 
  className = '',
  showTierSwitcher = true 
}) => {
  const { currentTenant } = useTenant();
  
  // If no tenant data, return null
  if (!currentTenant) {
    return null;
  }
  
  // Calculate days left in trial
  const trialEndDate = currentTenant.trial_ends_at 
    ? new Date(currentTenant.trial_ends_at) 
    : null;
  
  const isTrialMode = currentTenant.subscription_status === 'trialing';
  
  let daysLeft = 0;
  if (trialEndDate) {
    daysLeft = differenceInDays(trialEndDate, new Date());
  }
  
  // Different warning levels based on days remaining
  const isExpiringSoon = daysLeft <= 3 && daysLeft >= 0;
  const isExpiring = daysLeft <= 7 && daysLeft > 3;
  const isExpired = daysLeft < 0;
  
  // Determine display style based on urgency
  let bgColor, borderColor, textColor, buttonVariant;
  if (isExpired) {
    bgColor = 'bg-red-100';
    borderColor = 'border-red-400';
    textColor = 'text-red-900';
    buttonVariant = "destructive";
  } else if (isExpiringSoon) {
    bgColor = 'bg-red-50';
    borderColor = 'border-red-300';
    textColor = 'text-red-800';
    buttonVariant = "destructive";
  } else if (isExpiring) {
    bgColor = 'bg-amber-50';
    borderColor = 'border-amber-300';
    textColor = 'text-amber-800';
    buttonVariant = "default";
  } else {
    bgColor = 'bg-blue-50';
    borderColor = 'border-blue-300';
    textColor = 'text-blue-800';
    buttonVariant = "outline";
  }
  
  // If not on trial and showTierSwitcher is false, don't show anything
  if (!isTrialMode && !showTierSwitcher) {
    return null;
  }
  
  if (!isTrialMode && showTierSwitcher) {
    // For testing - show a tier switcher if not on trial
    return <TierTestingBanner className={className} />;
  }
  
  // Standard trial banner
  return (
    <StandardTrialBanner 
      daysLeft={daysLeft}
      isExpired={isExpired}
      isExpiringSoon={isExpiringSoon}
      isExpiring={isExpiring}
      textColor={textColor}
      bgColor={bgColor}
      borderColor={borderColor}
      buttonVariant={buttonVariant}
      showTierSwitcher={showTierSwitcher}
      className={className}
    />
  );
};
