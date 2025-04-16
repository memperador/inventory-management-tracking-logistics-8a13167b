
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { FeatureAccessLevel } from '@/utils/subscriptionUtils';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

interface UpgradePromptProps {
  title: string;
  description: string;
  requiredTier: FeatureAccessLevel;
  compact?: boolean;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  title,
  description,
  requiredTier,
  compact = false
}) => {
  const navigate = useNavigate();
  const { isTrialMode } = useFeatureAccess();
  
  const handleUpgradeClick = () => {
    navigate('/payment');
  };
  
  const getTierStyles = () => {
    switch (requiredTier) {
      case 'premium':
        return {
          bgClass: 'bg-amber-50',
          borderClass: 'border-amber-200',
          iconClass: 'text-amber-600',
          buttonVariant: 'default' as const
        };
      case 'standard':
        return {
          bgClass: 'bg-blue-50',
          borderClass: 'border-blue-200',
          iconClass: 'text-blue-600',
          buttonVariant: 'outline' as const
        };
      case 'enterprise':
        return {
          bgClass: 'bg-purple-50',
          borderClass: 'border-purple-200',
          iconClass: 'text-purple-600',
          buttonVariant: 'outline' as const
        };
      default:
        return {
          bgClass: 'bg-gray-50',
          borderClass: 'border-gray-200',
          iconClass: 'text-gray-600',
          buttonVariant: 'outline' as const
        };
    }
  };
  
  const styles = getTierStyles();
  
  if (compact) {
    return (
      <div className={`p-4 rounded-md border ${styles.borderClass} ${styles.bgClass} flex items-center justify-between`}>
        <div className="flex items-center">
          <Lock className={`h-5 w-5 mr-3 ${styles.iconClass}`} />
          <div>
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} tier required</p>
          </div>
        </div>
        <Button size="sm" variant={styles.buttonVariant} onClick={handleUpgradeClick}>
          {isTrialMode ? 'Start Trial' : 'Upgrade'}
        </Button>
      </div>
    );
  }
  
  return (
    <Card className={`border ${styles.borderClass} ${styles.bgClass}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Lock className={`h-5 w-5 mr-2 ${styles.iconClass}`} />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100">
            {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} Tier
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          className="w-full" 
          variant={styles.buttonVariant}
          onClick={handleUpgradeClick}
        >
          {isTrialMode ? 'Already in Trial' : 'Upgrade to Unlock'}
        </Button>
      </CardContent>
    </Card>
  );
};
