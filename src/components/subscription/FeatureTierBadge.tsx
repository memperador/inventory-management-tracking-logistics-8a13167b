
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Star } from 'lucide-react';

interface FeatureTierBadgeProps {
  tier: string;
  isTrialMode?: boolean;
  variant?: 'default' | 'small';
  showIcon?: boolean;
}

export const FeatureTierBadge: React.FC<FeatureTierBadgeProps> = ({ 
  tier, 
  isTrialMode = false,
  variant = 'default',
  showIcon = true
}) => {
  let label = tier.charAt(0).toUpperCase() + tier.slice(1);
  
  if (isTrialMode) {
    label += ' Trial';
  }
  
  const getIcon = () => {
    if (!showIcon) return null;
    
    switch (tier) {
      case 'premium':
        return <Crown className="h-3.5 w-3.5 mr-1" />;
      case 'standard':
        return <Star className="h-3.5 w-3.5 mr-1" />;
      case 'enterprise':
        return <Sparkles className="h-3.5 w-3.5 mr-1" />;
      default:
        return null;
    }
  };
  
  const getBadgeClassName = () => {
    const baseClass = 'border border-opacity-50 text-xs';
    
    if (variant === 'small') {
      return `${baseClass} px-1.5 py-0.5 rounded text-[10px]`;
    }
    
    switch (tier) {
      case 'premium':
        return `${baseClass} bg-amber-100 border-amber-300 text-amber-900`;
      case 'standard':
        return `${baseClass} bg-blue-100 border-blue-300 text-blue-900`;
      case 'enterprise':
        return `${baseClass} bg-purple-100 border-purple-300 text-purple-900`;
      default:
        return `${baseClass} bg-gray-100 border-gray-300 text-gray-900`;
    }
  };
  
  return (
    <Badge variant="outline" className={getBadgeClassName()}>
      <span className="flex items-center">
        {getIcon()}
        {label}
      </span>
    </Badge>
  );
};
