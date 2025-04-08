
import React from 'react';
import { Sparkles } from 'lucide-react';

interface AICapabilitiesProps {
  capabilities: string[];
}

const AICapabilities: React.FC<AICapabilitiesProps> = ({ capabilities }) => {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium mb-2">Capabilities</h4>
      <div className="flex flex-wrap gap-2 mb-4">
        {capabilities.map((capability, index) => (
          <div key={index} className="text-xs bg-muted rounded-full px-2.5 py-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            {capability}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AICapabilities;
