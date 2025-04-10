
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { getUpgradePromptForFeature } from '@/utils/subscription/upgrades';

export const useUpgradePrompt = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Prompt for upgrade with redirect to payment page
  const promptUpgrade = (featureKey: string): void => {
    const upgradeInfo = getUpgradePromptForFeature(featureKey);
    
    if (upgradeInfo) {
      toast({
        title: upgradeInfo.title,
        description: upgradeInfo.description,
        action: <Button onClick={() => navigate('/payment')}>Upgrade</Button>
      });
    }
  };

  return { promptUpgrade };
};
