
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import AIMessage, { AIMessage as AIMessageType } from './AIMessage';

interface ErrorsTabProps {
  messages: AIMessageType[];
  onChangeTab: (tab: string) => void;
}

const ErrorsTab: React.FC<ErrorsTabProps> = ({ messages, onChangeTab }) => {
  const errorMessages = messages.filter(msg => msg.type === 'error');
  
  return (
    <>
      <ScrollArea className="max-h-[400px] bg-muted/40 p-3 space-y-4">
        {errorMessages.length > 0 ? (
          <div className="space-y-4">
            {errorMessages.map((msg, idx) => (
              <div key={idx} className="flex justify-start">
                <AIMessage message={msg} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground">No errors detected recently</p>
            <p className="text-xs text-muted-foreground mt-1">
              Any application errors will appear here
            </p>
          </div>
        )}
      </ScrollArea>
      
      <CardFooter className="p-3 pt-2 border-t">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => onChangeTab('chat')}
        >
          Ask for help with an issue
        </Button>
      </CardFooter>
    </>
  );
};

export default ErrorsTab;
