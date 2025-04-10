
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, SparklesIcon } from 'lucide-react';
import { useTenant } from '@/hooks/useTenantContext';
import { differenceInDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FeatureAccessLevel } from '@/utils/subscriptionUtils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface TrialBannerProps {
  className?: string;
  showTierSwitcher?: boolean;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ 
  className = '',
  showTierSwitcher = true 
}) => {
  const { currentTenant, setCurrentTenant } = useTenant();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  
  // Function to quickly switch subscription tiers for testing
  const switchTier = async (tier: FeatureAccessLevel) => {
    try {
      if (!currentTenant?.id) return;
      
      const { error } = await supabase
        .from('tenants')
        .update({
          subscription_tier: tier,
          subscription_status: 'active',
          // Clear trial end date
          trial_ends_at: null
        })
        .eq('id', currentTenant.id);
        
      if (error) throw error;
      
      // Update local tenant state
      setCurrentTenant({
        ...currentTenant,
        subscription_tier: tier,
        subscription_status: 'active',
        trial_ends_at: null
      });
      
      toast({
        title: "Subscription Updated",
        description: `Switched to ${tier.charAt(0).toUpperCase() + tier.slice(1)} tier successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to switch tiers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };
  
  // Function to start a trial
  const startTrial = async () => {
    try {
      if (!currentTenant?.id) return;
      
      // Calculate trial end date - 7 days from now
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      
      const { error } = await supabase
        .from('tenants')
        .update({
          subscription_tier: 'premium',
          subscription_status: 'trialing',
          trial_ends_at: trialEndsAt.toISOString()
        })
        .eq('id', currentTenant.id);
        
      if (error) throw error;
      
      // Update local tenant state
      setCurrentTenant({
        ...currentTenant,
        subscription_tier: 'premium',
        subscription_status: 'trialing',
        trial_ends_at: trialEndsAt.toISOString()
      });
      
      toast({
        title: "Trial Started",
        description: "Your 7-day Premium trial has been started",
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to start trial: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };
  
  // If not on trial and showTierSwitcher is false, don't show anything
  if (!isTrialMode && !showTierSwitcher) {
    return null;
  }
  
  if (!isTrialMode && showTierSwitcher) {
    // For testing - show a tier switcher if not on trial
    return (
      <div className={`bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center ${className}`}>
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-slate-600" />
          <div>
            <span className="text-sm font-medium text-slate-800">
              Testing Mode: Current Tier - {currentTenant.subscription_tier || 'None'}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={startTrial}
          >
            Start Trial
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Switch Tier
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => switchTier('basic')}>
                Basic Tier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchTier('standard')}>
                Standard Tier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchTier('premium')}>
                Premium Tier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchTier('enterprise')}>
                Enterprise Tier
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }
  
  // Standard trial banner
  return (
    <div 
      className={`${bgColor} ${borderColor} 
        border rounded-lg p-3 flex justify-between items-center ${className}`}
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
        
        {showTierSwitcher && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Test Tier
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => switchTier('basic')}>
                Basic Tier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchTier('standard')}>
                Standard Tier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchTier('premium')}>
                Premium Tier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => switchTier('enterprise')}>
                Enterprise Tier
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
