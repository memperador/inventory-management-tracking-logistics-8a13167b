
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Lock } from 'lucide-react';

interface ChatInputProps {
  input: string;
  tier: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  tier,
  isLoading,
  onInputChange,
  onSendMessage
}) => {
  return (
    <>
      <div className="flex gap-2 w-full">
        <Input
          placeholder={`Ask about ${tier === 'basic' ? 'inventory management' : tier === 'standard' ? 'inventory and tracking' : 'asset management'}...`}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          disabled={isLoading}
        />
        <Button onClick={onSendMessage} disabled={isLoading || !input.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      
      {tier !== 'premium' && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          <span>
            Upgrade to Premium for our most advanced AI model with detailed asset management insights
          </span>
        </div>
      )}
    </>
  );
};

export default ChatInput;
