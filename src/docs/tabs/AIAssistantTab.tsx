
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import AIAssistantDocumentation from '@/components/docs/AIAssistantDocumentation';

const AIAssistantTab: React.FC = () => {
  return (
    <ScrollArea className="h-[750px] pr-4">
      <AIAssistantDocumentation />
    </ScrollArea>
  );
};

export default AIAssistantTab;
