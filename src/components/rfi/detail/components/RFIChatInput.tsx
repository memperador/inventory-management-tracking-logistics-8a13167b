
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Lock } from 'lucide-react';

interface RFIChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isPremium: boolean;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

const RFIChatInput: React.FC<RFIChatInputProps> = ({
  input,
  setInput,
  isPremium,
  isLoading,
  handleSubmit
}) => {
  return (
    <>
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
      
      {!isPremium && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 w-full">
          <Lock className="h-3 w-3" />
          <span>
            Upgrade to Premium for detailed, industry-specific RFI guidance
          </span>
        </div>
      )}
    </>
  );
};

export default RFIChatInput;
