
import React from 'react';
import { Check } from 'lucide-react';

interface AICapabilityListProps {
  capabilities: string[];
}

const AICapabilityList: React.FC<AICapabilityListProps> = ({ capabilities }) => {
  if (!capabilities.length) return null;
  
  return (
    <div className="mb-4 bg-muted/30 rounded-md p-3">
      <h3 className="text-sm font-medium mb-2">AI Assistant Capabilities:</h3>
      <ul className="space-y-1">
        {capabilities.map((capability, idx) => (
          <li key={idx} className="flex items-center text-sm">
            <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
            <span>{capability}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AICapabilityList;
