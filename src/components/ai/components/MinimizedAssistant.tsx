
import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, X } from 'lucide-react';

interface MinimizedAssistantProps {
  onMaximize: () => void;
  onClose: () => void;
}

const MinimizedAssistant: React.FC<MinimizedAssistantProps> = ({ onMaximize, onClose }) => {
  return (
    <div className="flex items-center gap-2 bg-background border rounded-full p-2 shadow-lg">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMaximize}
        className="h-8 w-8 rounded-full"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
      <span className="font-medium text-sm">Construction Assistant</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 rounded-full"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MinimizedAssistant;
