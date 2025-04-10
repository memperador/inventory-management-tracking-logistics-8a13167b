
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { FeatureAccessLevel } from '@/utils/subscriptionUtils';
import { useTenant } from '@/hooks/useTenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TierSwitcherProps {
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm';
  onTierSwitch?: (tier: FeatureAccessLevel) => void;
}

export const TierSwitcher: React.FC<TierSwitcherProps> = ({ 
  variant = 'outline',
  size = 'sm',
  onTierSwitch
}) => {
  const { currentTenant, setCurrentTenant } = useTenant();
  const { toast } = useToast();

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

      if (onTierSwitch) {
        onTierSwitch(tier);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to switch tiers: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
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
  );
};

export default TierSwitcher;
