
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bot, Sparkles, Settings } from 'lucide-react';

interface TierBadgeProps {
  tier: 'basic' | 'standard' | 'premium' | 'enterprise';
}

const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
  switch(tier) {
    case 'premium':
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
          <Sparkles className="h-3 w-3 mr-1 text-purple-600" /> Premium
        </Badge>
      );
    case 'standard':
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          <Bot className="h-3 w-3 mr-1 text-blue-600" /> Standard
        </Badge>
      );
    case 'enterprise':
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
          <Settings className="h-3 w-3 mr-1 text-amber-600" /> Enterprise
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
          <Bot className="h-3 w-3 mr-1 text-gray-600" /> Basic
        </Badge>
      );
  }
};

export default TierBadge;
