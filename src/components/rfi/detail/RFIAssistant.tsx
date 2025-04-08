
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Lock, Sparkles } from 'lucide-react';
import { useRFIAssistant } from '../hooks/useRFIAssistant';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const RFIAssistant: React.FC = () => {
  const { messages, input, isLoading, setInput, sendMessage, isKeySet, setApiKey } = useRFIAssistant();
  const { hasSubscriptionTier } = useFeatureAccess();
  const [apiKeyInput, setApiKeyInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isPremium = hasSubscriptionTier('premium');

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

  const handleSetApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-primary" />
            <CardTitle>RFI Assistant</CardTitle>
            {isPremium && (
              <Badge variant="outline" className="ml-2 bg-primary/10">
                <Sparkles className="h-3 w-3 mr-1" /> Premium
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>AI-powered guidance for effective Request for Information forms</CardDescription>
      </CardHeader>
      
      {!isKeySet && (
        <div className="px-4 mb-3">
          <Alert variant="outline" className="bg-muted/30">
            <AlertDescription className="text-sm">
              {isPremium ? 
                "Set your Perplexity API key to access premium RFI guidance with our most advanced AI model." : 
                "Set your Perplexity API key for enhanced RFI assistance. Premium users receive more detailed guidance."}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2 mt-3">
            <Input 
              type="password"
              placeholder="Enter Perplexity API Key" 
              value={apiKeyInput} 
              onChange={e => setApiKeyInput(e.target.value)} 
              className="flex-1"
            />
            <Button onClick={handleSetApiKey}>Connect</Button>
          </div>
        </div>
      )}
      
      <CardContent className="flex-1 p-0 px-4">
        <ScrollArea className={isKeySet ? "h-[460px]" : "h-[380px]"} ref={scrollAreaRef}>
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
      
      <CardFooter className="border-t p-3 mt-auto space-y-2">
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
        
        {/* Premium tier callout for lower tiers */}
        {!isPremium && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 w-full">
            <Lock className="h-3 w-3" />
            <span>
              Upgrade to Premium for detailed, industry-specific RFI guidance
            </span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default RFIAssistant;
