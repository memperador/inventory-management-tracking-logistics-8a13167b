
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  timestamp: Date;
}

interface RFIMessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const RFIMessageList: React.FC<RFIMessageListProps> = ({ messages, isLoading }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <ScrollArea className={isLoading ? "h-[460px]" : "h-[380px]"} ref={scrollAreaRef}>
      <div className="space-y-4 p-4">
        {messages.map((message, index) => (
          <div 
            key={message.id}
            className={`flex max-w-[80%] rounded-lg p-4 ${
              index === 0 || index % 2 === 0 
                ? "bg-muted text-foreground ml-0" 
                : "bg-primary text-primary-foreground ml-auto"
            }`}
          >
            {(index === 0 || index % 2 === 0) && (
              <Bot className="h-5 w-5 mr-2 flex-shrink-0 mt-1" />
            )}
            <div>
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex max-w-[80%] rounded-lg p-4 bg-muted">
            <Bot className="h-5 w-5 mr-2 flex-shrink-0" />
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default RFIMessageList;
