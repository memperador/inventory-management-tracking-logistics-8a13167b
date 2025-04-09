
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useTenant } from '@/hooks/useTenantContext';
import { differenceInDays } from 'date-fns';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SubscriptionExpiryBannerProps {
  className?: string;
}

export const SubscriptionExpiryBanner: React.FC<SubscriptionExpiryBannerProps> = ({ className = '' }) => {
  const { currentTenant } = useTenant();
  const navigate = useNavigate();
  const [dismissedUntil, setDismissedUntil] = useLocalStorage<Record<string, string>>('dismissed_subscription_warnings', {});
  
  // Return null if no tenant data or on trial
  if (!currentTenant || 
      currentTenant.subscription_status === 'trialing' || 
      !currentTenant.subscription_expires_at) {
    return null;
  }
  
  // Calculate days until expiration
  const expiryDate = new Date(currentTenant.subscription_expires_at);
  const daysLeft = differenceInDays(expiryDate, new Date());
  
  // Check if this warning was dismissed
  const tenantKey = currentTenant.id;
  const dismissedDate = dismissedUntil[tenantKey] ? new Date(dismissedUntil[tenantKey]) : null;
  
  // If dismissed and dismissal is still valid, don't show
  if (dismissedDate && dismissedDate > new Date()) {
    return null;
  }
  
  // Only show warning when subscription is about to expire
  if (daysLeft > 14) {
    return null;
  }
  
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
  
  const handleDismiss = () => {
    // Dismiss for 3 days
    const dismissUntil = new Date();
    dismissUntil.setDate(dismissUntil.getDate() + 3);
    setDismissedUntil({...dismissedUntil, [tenantKey]: dismissUntil.toISOString()});
  };
  
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
          <CreditCard className="h-5 w-5 text-blue-600" />
        )}
        <div>
          <span className={`text-sm font-medium ${textColor}`}>
            {isExpiringSoon 
              ? `URGENT: Your ${currentTenant.subscription_tier} subscription expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!` 
              : isExpiring
                ? `Your ${currentTenant.subscription_tier} subscription expires in ${daysLeft} days`
                : `Your ${currentTenant.subscription_tier} subscription will renew in ${daysLeft} days`}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="text-xs"
        >
          Remind me later
        </Button>
        <Button
          size="sm"
          variant={buttonVariant as any}
          onClick={() => navigate('/payment')}
          className={isExpiringSoon ? "bg-red-600 hover:bg-red-700" : (isExpiring ? "bg-amber-600 hover:bg-amber-700" : "")}
        >
          {isExpiringSoon ? 'Renew Now' : 'Manage Subscription'}
        </Button>
      </div>
    </div>
  );
};
