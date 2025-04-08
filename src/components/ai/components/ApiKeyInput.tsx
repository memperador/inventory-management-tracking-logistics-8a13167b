
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

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
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">
                AI services require configuration by an administrator
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                For full functionality, please contact your administrator to configure AI services. 
                You may temporarily enter an API key below, but it will only be available for your current session.
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-2">
        <Input
          type="password"
          placeholder="Enter Perplexity API Key (temporary)"
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
