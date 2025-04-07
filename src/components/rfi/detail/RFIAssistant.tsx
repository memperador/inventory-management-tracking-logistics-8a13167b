
import React, { useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send } from 'lucide-react';
import { useRFIAssistant } from '../hooks/useRFIAssistant';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const RFIAssistant: React.FC = () => {
  const { messages, input, isLoading, setInput, sendMessage } = useRFIAssistant();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <Bot className="h-5 w-5 mr-2 text-primary" />
          <CardTitle>RFI Assistant</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 px-4">
        <ScrollArea className="h-[460px]" ref={scrollAreaRef}>
          <div className="space-y-4 p-4">
            {messages.map((message, index) => (
              <div 
                key={message.id}
                className={cn(
                  "flex max-w-[80%] rounded-lg p-4",
                  index === 0 || index % 2 === 0 
                    ? "bg-muted text-foreground ml-0" 
                    : "bg-primary text-primary-foreground ml-auto"
                )}
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
      </CardContent>
      
      <CardFooter className="border-t p-3 mt-auto">
        <form className="flex w-full gap-2" onSubmit={handleSubmit}>
          <Input
            placeholder="Ask about RFI best practices..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default RFIAssistant;
