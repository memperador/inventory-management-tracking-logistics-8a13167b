
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquarePlus } from 'lucide-react';
import AIMessage, { AIMessage as AIMessageType } from './AIMessage';

interface ChatTabProps {
  messages: AIMessageType[];
  input: string;
  isLoading: boolean;
  hasPremiumAccess: boolean;
  handleInputChange: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
}

const ChatTab: React.FC<ChatTabProps> = ({
  messages,
  input,
  isLoading,
  hasPremiumAccess,
  handleInputChange,
  handleSendMessage
}) => {
  return (
    <>
      <ScrollArea className="max-h-[350px] bg-muted/40 p-3 space-y-4">
        <div className="space-y-4">
          {messages
            .filter(msg => msg.type !== 'error' && msg.type !== 'recommendation')
            .map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <AIMessage message={msg} />
              </div>
            ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-2 bg-background border">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                    <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  </div>
                  <p className="text-sm">Assistant is typing...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <CardFooter className="p-3 pt-2 border-t">
        <form onSubmit={handleSendMessage} className="w-full flex gap-2">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={isLoading || !hasPremiumAccess}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={isLoading || !input.trim() || !hasPremiumAccess}
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </>
  );
};

export default ChatTab;
