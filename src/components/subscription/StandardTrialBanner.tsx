
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, SparklesIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TierSwitcher from './TierSwitcher';

interface StandardTrialBannerProps {
  daysLeft: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
  isExpiring: boolean;
  textColor: string;
  bgColor: string;
  borderColor: string;
  buttonVariant: string;
  showTierSwitcher: boolean;
}

export const StandardTrialBanner: React.FC<StandardTrialBannerProps> = ({
  daysLeft,
  isExpired,
  isExpiringSoon,
  isExpiring,
  textColor,
  bgColor,
  borderColor,
  buttonVariant,
  showTierSwitcher
}) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className={`${bgColor} ${borderColor} 
        border rounded-lg p-3 flex justify-between items-center`}
    >
      <div className="flex items-center space-x-2">
        {isExpired ? (
          <AlertCircle className="h-5 w-5 text-red-600" />
        ) : isExpiringSoon ? (
          <AlertCircle className="h-5 w-5 text-red-600" />
        ) : isExpiring ? (
          <AlertCircle className="h-5 w-5 text-amber-600" />
        ) : (
          <Clock className="h-5 w-5 text-blue-600" />
        )}
        <div>
          <span className={`text-sm font-medium ${textColor}`}>
            {isExpired 
              ? `Your free trial has expired!` 
              : isExpiringSoon 
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
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={buttonVariant as any}
          onClick={() => navigate('/payment')}
          className={isExpired || isExpiringSoon ? "bg-red-600 hover:bg-red-700" : (isExpiring ? "bg-amber-600 hover:bg-amber-700" : "")}
        >
          {isExpired ? 'Subscribe Now' : isExpiringSoon ? 'Subscribe Now' : 'Choose Plan'}
        </Button>
        
        {showTierSwitcher && <TierSwitcher size="sm" />}
      </div>
    </div>
  );
};

export default StandardTrialBanner;
