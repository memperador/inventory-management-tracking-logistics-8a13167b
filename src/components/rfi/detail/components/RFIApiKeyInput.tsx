
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RFIApiKeyInputProps {
  apiKeyInput: string;
  isPremium: boolean;
  setApiKeyInput: (key: string) => void;
  handleSetApiKey: () => void;
}

const RFIApiKeyInput: React.FC<RFIApiKeyInputProps> = ({
  apiKeyInput,
  isPremium,
  setApiKeyInput,
  handleSetApiKey
}) => {
  return (
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
  );
};

export default RFIApiKeyInput;
