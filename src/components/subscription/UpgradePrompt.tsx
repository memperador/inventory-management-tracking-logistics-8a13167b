
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, ArrowRight } from 'lucide-react';
import { FeatureAccessLevel } from '@/utils/subscriptionUtils';

interface UpgradePromptProps {
  title: string;
  description: string;
  requiredTier: FeatureAccessLevel;
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  title,
  description,
  requiredTier,
  className = ''
}) => {
  const navigate = useNavigate();
  
  // Map tiers to proper display names
  const tierDisplayNames: Record<FeatureAccessLevel, string> = {
    basic: 'Basic',
    standard: 'Standard',
    premium: 'Premium'
  };
  
  // Get gradient colors based on required tier
  const getTierGradient = (): string => {
    switch (requiredTier) {
      case 'standard':
        return 'from-blue-100 to-blue-50 border-blue-200';
      case 'premium':
        return 'from-purple-100 to-purple-50 border-purple-200';
      default:
        return 'from-gray-100 to-gray-50 border-gray-200';
    }
  };
  
  return (
    <Card className={`bg-gradient-to-b ${getTierGradient()} ${className}`}>
      <CardContent className="flex flex-col items-center text-center p-6 space-y-4">
        <Zap className={`w-10 h-10 ${requiredTier === 'premium' ? 'text-purple-500' : 'text-blue-500'}`} />
        
        <div className="space-y-2">
          <h3 className="font-semibold text-xl">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
          <div className="text-sm font-medium mt-1">
            Required plan: {tierDisplayNames[requiredTier]}
          </div>
        </div>
        
        <Button 
          className={`mt-4 ${requiredTier === 'premium' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
          onClick={() => navigate('/payment')}
        >
          Upgrade Now <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
