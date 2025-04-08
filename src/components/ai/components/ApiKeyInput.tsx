
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ApiKeyInputProps {
  apiKey: string;
  tier: string;
  onApiKeyChange: (key: string) => void;
  onSetApiKey: () => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  apiKey,
  tier,
  onApiKeyChange,
  onSetApiKey
}) => {
  return (
    <div className="mb-4 space-y-3">
      <Alert variant="outline" className="bg-muted/50">
        <AlertDescription>
          {tier === 'premium' ? 
            "Set your Perplexity API key to activate live AI responses with our most advanced model." :
            "Set your Perplexity API key to activate live AI responses. Premium tier users get access to our most powerful model."}
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-2">
        <Input
          type="password"
          placeholder="Enter Perplexity API Key"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          className="flex-1"
        />
        <Button onClick={onSetApiKey} disabled={!apiKey.trim()}>
          Connect
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyInput;
