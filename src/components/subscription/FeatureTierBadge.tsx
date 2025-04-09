
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StarIcon, ZapIcon, BuildingIcon, SparklesIcon } from 'lucide-react';

interface FeatureTierBadgeProps {
  tier: 'basic' | 'standard' | 'premium' | 'enterprise';
  isTrialMode?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export const FeatureTierBadge: React.FC<FeatureTierBadgeProps> = ({
  tier,
  isTrialMode = false,
  showTooltip = true,
  className = ''
}) => {
  const tierConfig = {
    basic: {
      icon: StarIcon,
      label: 'Basic',
      class: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      tooltip: 'This feature is included in the Basic tier'
    },
    standard: {
      icon: ZapIcon,
      label: 'Standard',
      class: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
      tooltip: 'This feature is included in the Standard tier'
    },
    premium: {
      icon: SparklesIcon,
      label: 'Premium',
      class: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      tooltip: 'This feature is included in the Premium tier'
    },
    enterprise: {
      icon: BuildingIcon,
      label: 'Enterprise',
      class: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      tooltip: 'This feature is included in the Enterprise tier'
    }
  };

  const { icon: Icon, label, class: badgeClass, tooltip } = tierConfig[tier];

  const badge = (
    <Badge 
      variant="outline"
      className={`${badgeClass} flex items-center gap-1 font-normal py-0.5 px-2 ${className} ${isTrialMode ? 'ring-1 ring-amber-400' : ''}`}
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
      {isTrialMode && <span className="text-xs">(Trial)</span>}
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}{isTrialMode ? ' - Available during your trial period' : ''}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};
