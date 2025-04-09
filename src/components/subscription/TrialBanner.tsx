
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, SparklesIcon } from 'lucide-react';
import { useTenant } from '@/hooks/useTenantContext';
import { differenceInDays } from 'date-fns';

interface TrialBannerProps {
  className?: string;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ className = '' }) => {
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  
  // Return null if no tenant data or not on trial
  if (!currentTenant || currentTenant.subscription_status !== 'trialing') {
    return null;
  }
  
  // Calculate days left in trial
  const trialEndDate = currentTenant.trial_ends_at 
    ? new Date(currentTenant.trial_ends_at) 
    : null;
  
  if (!trialEndDate) return null;
  
  const daysLeft = differenceInDays(trialEndDate, new Date());
  
  // Different warning levels based on days remaining
  const isExpiringSoon = daysLeft <= 3;
  const isExpiring = daysLeft <= 7 && daysLeft > 3;
  
  // Determine display style based on urgency
  let bgColor, borderColor, textColor, buttonVariant;
  if (isExpiringSoon) {
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
  
  return (
    <div 
      className={`${bgColor} ${borderColor} 
        border rounded-lg p-3 flex justify-between items-center ${className}`}
    >
      <div className="flex items-center space-x-2">
        {isExpiringSoon ? (
          <AlertCircle className="h-5 w-5 text-red-600" />
        ) : isExpiring ? (
          <AlertCircle className="h-5 w-5 text-amber-600" />
        ) : (
          <Clock className="h-5 w-5 text-blue-600" />
        )}
        <div>
          <span className={`text-sm font-medium ${textColor}`}>
            {isExpiringSoon 
              ? `URGENT: Your free trial expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!` 
              : isExpiring
                ? `Your free trial expires in ${daysLeft} days!`
                : `You're on a free trial (${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining)`}
          </span>
          <div className="flex items-center mt-1">
            <SparklesIcon className="h-3.5 w-3.5 text-purple-600 mr-1" />
            <span className="text-xs text-purple-800">
              Experiencing all Premium tier features during your trial
            </span>
          </div>
        </div>
      </div>
      
      <Button
        size="sm"
        variant={buttonVariant as any}
        onClick={() => navigate('/payment')}
        className={isExpiringSoon ? "bg-red-600 hover:bg-red-700" : (isExpiring ? "bg-amber-600 hover:bg-amber-700" : "")}
      >
        {isExpiringSoon ? 'Subscribe Now' : 'Choose Plan'}
      </Button>
    </div>
  );
};
