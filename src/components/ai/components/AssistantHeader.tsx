
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Minimize2, X } from 'lucide-react';
import TierBadge from './TierBadge';

interface AssistantHeaderProps {
  tier: 'basic' | 'standard' | 'premium' | 'enterprise';
  onMinimize: () => void;
  onClose: () => void;
}

const AssistantHeader: React.FC<AssistantHeaderProps> = ({ tier, onMinimize, onClose }) => {
  return (
    <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
      <div className="flex flex-col">
        <CardTitle className="text-md flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Construction Assistant
        </CardTitle>
        <div className="mt-1">
          <TierBadge tier={tier} />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMinimize}
          className="h-8 w-8"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </CardHeader>
  );
};

export default AssistantHeader;
