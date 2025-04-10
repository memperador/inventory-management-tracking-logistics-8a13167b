
import React from 'react';
import { Button } from '@/components/ui/button';
import { SparklesIcon } from 'lucide-react';
import { useTenant } from '@/hooks/useTenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import TierSwitcher from './TierSwitcher';

interface TierTestingBannerProps {
  className?: string;
}

export const TierTestingBanner: React.FC<TierTestingBannerProps> = ({ className = '' }) => {
  const { currentTenant, setCurrentTenant } = useTenant();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  
  return (
    <div className={`bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center ${className}`}>
      <div className="flex items-center space-x-2">
        <SparklesIcon className="h-5 w-5 text-slate-600" />
        <div>
          <span className="text-sm font-medium text-slate-800">
            Testing Mode: Current Tier - {currentTenant?.subscription_tier || 'None'}
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
        
        <TierSwitcher size="sm" />
      </div>
    </div>
  );
};

export default TierTestingBanner;
