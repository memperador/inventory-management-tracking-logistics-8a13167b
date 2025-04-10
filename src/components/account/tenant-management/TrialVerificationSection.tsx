
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface TrialVerificationSectionProps {
  lookupResult: any | null;
  trialVerificationResult: any | null;
  isLoading: boolean;
  onVerify: () => Promise<void>;
}

const TrialVerificationSection: React.FC<TrialVerificationSectionProps> = ({
  lookupResult,
  trialVerificationResult,
  isLoading,
  onVerify
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Verify Trial Period</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {lookupResult 
          ? `Check if ${lookupResult.email}'s tenant trial period is configured correctly` 
          : 'Check if the current tenant\'s trial period is configured correctly'}
      </p>
      
      <Button 
        onClick={onVerify} 
        disabled={isLoading}
        variant="outline"
      >
        Verify Trial Status
      </Button>
      
      {trialVerificationResult && (
        <Alert className="mt-4" variant={trialVerificationResult.isValid ? "default" : "destructive"}>
          <div className="flex items-center">
            {trialVerificationResult.isValid ? (
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <AlertTitle>Trial Verification {trialVerificationResult.isValid ? 'Succeeded' : 'Failed'}</AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            {trialVerificationResult.message}
            {trialVerificationResult.daysLeft > 0 && (
              <div className="mt-1">Days left in trial: {trialVerificationResult.daysLeft}</div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TrialVerificationSection;
